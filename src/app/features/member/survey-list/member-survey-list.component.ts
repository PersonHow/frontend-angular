import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Trash2, Edit, Eye, ArrowUp, ArrowDown } from 'lucide-angular';

import { SidebarComponent, SearchBarComponent,
    PaginationComponent, ConfirmDialogComponent } from '../../../shared/components';

import { SurveyService } from '../../../core/services/survey.service';
import { SurveyListItem, SurveyStatus, SurveySearchRequest } from '../../../shared/models/survey.model';
import { SearchField, SearchParams } from '../../../shared/models/search.model';
import { PageResponse } from '../../../shared/models/common.model';

@Component({
    selector: 'app-member-survey-list',
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
    templateUrl: './member-survey-list.component.html',
    styleUrls: ['./member-survey-list.component.scss']
})
export class MemberSurveyListComponent implements OnInit {
    private surveyService = inject(SurveyService);

    readonly icons = { Trash2, Edit, Eye, ArrowUp, ArrowDown };
    readonly SurveyStatus = SurveyStatus;

    // --- 資料狀態 ---
    surveys = signal<SurveyListItem[]>([]);
    isLoading = signal(false);

    // --- 分頁狀態 ---
    currentPage = signal(1);
    totalElements = signal(0);
    totalPages = signal(0);

    // --- 排序狀態 ---
    sortColumn = signal<string>('id');
    sortDirection = signal<'asc' | 'desc'>('desc');

    // --- 搜尋狀態 ---
    searchFields: SearchField[] = [
        { name: 'title', label: '問卷名稱', type: 'text', placeholder: '搜尋問卷名稱...' },
        { name: 'startDate', label: '開始時間', type: 'date' },
        { name: 'endDate', label: '結束時間', type: 'date' }
    ];

    currentSearchRequest: SurveySearchRequest = {};

    // --- 刪除狀態 ---
    showDeleteDialog = signal(false);
    deleteMessage = signal('');
    targetDeleteId = signal<number | null>(null);

    ngOnInit(): void {
        this.loadData();
    }

    canEdit(survey: SurveyListItem): boolean {
        return survey.status === SurveyStatus.NOT_STARTED;
    }

    canDelete(survey: SurveyListItem): boolean {
        return survey.status === SurveyStatus.NOT_STARTED && survey.response_count === 0;
    }

    // 已結束的問卷只能觀看；進行中的問卷不提供任何操作
    canView(survey: SurveyListItem): boolean {
        return survey.status === SurveyStatus.CLOSED;
    }

    loadData(pageIndex: number = 0): void {
        this.isLoading.set(true);

        const request: SurveySearchRequest = {
            ...this.currentSearchRequest,
            page: pageIndex,
            size: 10,
            sortBy: this.sortColumn(),
            sortDirection: this.sortDirection()
        };

        this.surveyService.getMemberSurveys(request).subscribe({
            next: (res: PageResponse<SurveyListItem>) => {
                this.surveys.set(res.content);
                this.totalElements.set(res.total_elements);
                this.totalPages.set(res.total_pages);
                this.currentPage.set(res.page + 1);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    onSearch(params: SearchParams): void {
        this.currentSearchRequest = {
            title: params['title'],
            start_date: params['startDate'],
            end_date: params['endDate']
        };
        this.loadData(0);
    }

    onReset(): void {
        this.currentSearchRequest = {};
        this.loadData(0);
    }

    onPageChange(page: number): void {
        this.loadData(page - 1);
    }

    toggleSort(column: string): void {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set('desc');
        }
        this.loadData(0);
    }

    openDeleteSingle(survey: SurveyListItem): void {
        this.targetDeleteId.set(survey.id);
        this.deleteMessage.set(`確定要刪除問卷「${survey.title}」嗎？此操作無法復原。`);
        this.showDeleteDialog.set(true);
    }

    onConfirmDelete(): void {
        const id = this.targetDeleteId();
        if (!id) return;

        this.surveyService.deleteMemberSurvey(id).subscribe({
            next: () => {
                this.loadData(this.currentPage() - 1);
                this.showDeleteDialog.set(false);
            },
            error: () => alert('刪除失敗，請稍後再試')
        });
    }
}
