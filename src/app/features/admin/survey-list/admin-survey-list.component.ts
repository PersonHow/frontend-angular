import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Trash2, Edit, Eye, PieChart } from 'lucide-angular';

// 根據您的專案結構引用 Shared Components
import { SidebarComponent, SearchBarComponent, 
    PaginationComponent, ConfirmDialogComponent } from '../../../shared/components';

// 引用 Model 與 Service
import { SurveyService } from '../../../core/services/survey.service';
import { SurveyListItem, SurveyStatus, SurveySearchRequest } from '../../../shared/models/survey.model';
import { SearchField, SearchParams } from '../../../shared/models/search.model';
import { PageResponse } from '../../../shared/models/common.model';

@Component({
    selector: 'app-admin-survey-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideAngularModule,
        SidebarComponent,
        SearchBarComponent,
        PaginationComponent,
        ConfirmDialogComponent
    ],
    templateUrl: './admin-survey-list.component.html',
    styleUrls: ['./admin-survey-list.component.scss']
})
export class AdminSurveyListComponent implements OnInit {
    private surveyService = inject(SurveyService);

    // Icons
    readonly icons = { Trash2, Edit, Eye, PieChart };
    readonly SurveyStatus = SurveyStatus; // 供 Template 使用 Enum

    // --- 資料狀態 ---
    surveys = signal<SurveyListItem[]>([]);
    isLoading = signal(false);

    // --- 分頁狀態 (後端 0-based, 前端顯示 1-based) ---
    currentPage = signal(1);
    totalElements = signal(0);
    totalPages = signal(0);

    // --- 搜尋狀態 (定義欄位) ---
    searchFields: SearchField[] = [
        { name: 'title', label: '問卷名稱', type: 'text', placeholder: '搜尋問卷名稱...' },
        { name: 'startDate', label: '開始時間', type: 'date' },
        { name: 'endDate', label: '結束時間', type: 'date' }
    ];

    // 暫存當前的搜尋條件
    currentSearchRequest: SurveySearchRequest = {};

    // --- 選取與刪除狀態 ---
    selectedIds = signal<Set<number>>(new Set());

    // 全選狀態 (Computed)
    isAllSelected = computed(() => {
        const list = this.surveys();
        // 只有「可刪除」的項目才會被計入全選邏輯
        const deletableList = list.filter(s => this.canDelete(s));
        return deletableList.length > 0 && deletableList.every(s => this.selectedIds().has(s.id));
    });

    // ConfirmDialog 狀態
    showDeleteDialog = signal(false);
    deleteMessage = signal('');
    targetDeleteId = signal<number | null>(null); // null 代表批量刪除

    ngOnInit(): void {
        this.loadData();
    }

    // --- 核心邏輯：權限判斷 (因為 Model 沒有這些欄位，需自行判斷) ---
    canEdit(survey: SurveyListItem): boolean {
        return survey.status === SurveyStatus.NOT_STARTED;
    }

    canDelete(survey: SurveyListItem): boolean {
        // 邏輯：未開始 且 無人回應 才能刪除
        return survey.status === SurveyStatus.NOT_STARTED && survey.response_count === 0;
    }

    // --- API 資料載入 ---
    loadData(pageIndex: number = 0): void {
        this.isLoading.set(true);

        const request: SurveySearchRequest = {
            ...this.currentSearchRequest,
            page: pageIndex,
            size: 10
        };

        this.surveyService.getAdminSurveys(request).subscribe({
            next: (res: PageResponse<SurveyListItem>) => {
                this.surveys.set(res.content);
                this.totalElements.set(res.total_elements);
                this.totalPages.set(res.total_pages);
                this.currentPage.set(res.page_number + 1); // 轉為 1-based
                this.selectedIds.set(new Set()); // 換頁清空選取
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('載入失敗', err);
                this.isLoading.set(false);
            }
        });
    }

    // --- 事件處理：搜尋 ---
    onSearch(params: SearchParams): void {
        // 轉換 SearchBar 的參數到 API 請求格式
        this.currentSearchRequest = {
            title: params['title'],
            start_date: params['startDate'], // 對應 searchFields 的 name
            end_date: params['endDate']
        };
        this.loadData(0); // 搜尋後回到第一頁
    }

    onReset(): void {
        this.currentSearchRequest = {};
        this.loadData(0);
    }

    // --- 事件處理：分頁 ---
    onPageChange(page: number): void {
        this.loadData(page - 1); // 轉回 0-based 給 API
    }

    // --- 事件處理：選取 ---
    toggleSelection(id: number): void {
        const current = new Set(this.selectedIds());
        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }
        this.selectedIds.set(current);
    }

    toggleAll(event: Event): void {
        const isChecked = (event.target as HTMLInputElement).checked;
        if (isChecked) {
            // 只選取可刪除的項目
            const allDeletableIds = this.surveys()
                .filter(s => this.canDelete(s))
                .map(s => s.id);
            this.selectedIds.set(new Set(allDeletableIds));
        } else {
            this.selectedIds.set(new Set());
        }
    }

    // --- 事件處理：刪除 ---
    openDeleteSingle(survey: SurveyListItem): void {
        this.targetDeleteId.set(survey.id);
        this.deleteMessage.set(`確定要刪除問卷「${survey.title}」嗎？此操作無法復原。`);
        this.showDeleteDialog.set(true);
    }

    openDeleteBatch(): void {
        const count = this.selectedIds().size;
        if (count === 0) return;

        this.targetDeleteId.set(null); // 標記為批量
        this.deleteMessage.set(`確定要刪除選取的 ${count} 筆問卷嗎？`);
        this.showDeleteDialog.set(true);
    }

    onConfirmDelete(): void {
        const id = this.targetDeleteId();

        if (id) {
            // 單筆刪除
            this.surveyService.deleteAdminSurvey(id).subscribe({
                next: () => {
                    this.loadData(this.currentPage() - 1);
                    this.showDeleteDialog.set(false);
                },
                error: (err) => alert('刪除失敗，請稍後再試')
            });
        } else {
            // 批量刪除 (模擬，因 API 只有單筆刪除)
            const ids = Array.from(this.selectedIds());
            let settled = 0;

            ids.forEach(itemId => {
                this.surveyService.deleteAdminSurvey(itemId).subscribe({
                    next: () => {
                        settled++;
                        if (settled === ids.length) {
                            this.loadData(0);
                            this.showDeleteDialog.set(false);
                        }
                    },
                    error: () => {
                        settled++;
                        if (settled === ids.length) {
                            this.loadData(0);
                            this.showDeleteDialog.set(false);
                        }
                    }
                });
            });
        }
    }
}
