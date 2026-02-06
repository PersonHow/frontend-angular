import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, PenTool, Calendar, FileText, LogIn } from 'lucide-angular';

// Shared Components
import { SearchBarComponent, PaginationComponent, SidebarComponent } from '../../../shared/components';

// Services & Models
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SurveyListItem, SurveyStatus, SurveySearchRequest, SURVEY_STATUS_CONFIG } from '../../../shared/models/survey.model';
import { SearchField, SearchParams } from '../../../shared/models/search.model';
import { PageResponse } from '../../../shared/models/common.model';

@Component({
    selector: 'app-public-survey-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideAngularModule,
        SearchBarComponent,
        PaginationComponent,
        SidebarComponent
    ],
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
    private apiService = inject(ApiService);
    private authService = inject(AuthService);

    // Icons
    readonly icons = { Search, PenTool, Calendar, FileText, LogIn };
    readonly SurveyStatus = SurveyStatus;
    readonly statusConfig = SURVEY_STATUS_CONFIG;

    // 用戶狀態
    isMember = this.authService.isMember;
    isLoggedIn = this.authService.isLoggedIn;

    // 資料狀態
    surveys = signal<SurveyListItem[]>([]);
    isLoading = signal<boolean>(true);

    // 分頁狀態
    currentPage = signal(1);
    totalPages = signal(0);
    totalElements = signal(0);
    pageSize = signal(10);

    // 搜尋欄位設定
    searchFields: SearchField[] = [
        { name: 'title', label: '問卷名稱', type: 'text', placeholder: '搜尋問卷名稱...' },
        { name: 'startDate', label: '開始日期', type: 'date' },
        { name: 'endDate', label: '結束日期', type: 'date' }
    ];

    // 搜尋暫存
    currentSearch = signal<SurveySearchRequest>({});

    ngOnInit() {
        this.loadData(1);
        console.log("Survey-List 已被創建");
        
    }

    loadData(page: number) {
        this.isLoading.set(true);
        const apiPage = page - 1;

        const request: SurveySearchRequest = {
            ...this.currentSearch(),
            page: apiPage,
            size: this.pageSize()
        };

        this.apiService.getPublicSurveys(request).subscribe({
            next: (res) => {
                this.surveys.set(res.content);
                this.currentPage.set(res.page_number + 1);
                this.totalPages.set(res.total_pages);
                this.totalElements.set(res.total_elements);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    onSearch(params: SearchParams) {
        const request: SurveySearchRequest = {
            title: params['title'],
            start_date: params['startDate'],
            end_date: params['endDate']
        };
        this.currentSearch.set(request);
        this.loadData(1);
    }

    onReset() {
        this.currentSearch.set({});
        this.loadData(1);
    }

    onPageChange(page: number) {
        this.loadData(page);
    }

    // 輔助方法：判斷是否可以填寫
    canFill(survey: SurveyListItem): boolean {
        // 只有 ACTIVE 狀態才能填寫
        return survey.status === SurveyStatus.ACTIVE;
    }
}
