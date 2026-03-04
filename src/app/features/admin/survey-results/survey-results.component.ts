// src/app/features/admin/survey-results/survey-results.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, Eye, ArrowLeft, FileText, Download } from 'lucide-angular';

import { ResponseService } from '../../../core/services/response.service';
import { ResponseListItem } from '../../../shared/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-survey-results',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule, PaginationComponent],
    templateUrl: './survey-results.component.html',
    styleUrls: ['./survey-results.component.scss']
})
export class SurveyResultsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private responseService = inject(ResponseService);

    // Icons
    readonly icons = { Eye, ArrowLeft, FileText, Download };

    // State
    surveyId = signal<number>(0);
    surveyTitle = signal<string>('');
    responses = signal<ResponseListItem[]>([]);
    isLoading = signal<boolean>(true);

    // Pagination
    currentPage = signal(1);
    totalPages = signal(0);
    totalElements = signal(0);
    pageSize = signal(10);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id) {
                this.surveyId.set(id);
                this.loadData(1);
            }
        });
    }

    loadData(page: number) {
        this.isLoading.set(true);
        const apiPage = page - 1;

        // ✅ 修正點：使用 getAdminSurveyResponses
        this.responseService.getAdminSurveyResponses(this.surveyId(), apiPage, this.pageSize()).subscribe({
            next: (res) => {
                this.responses.set(res.content);
                this.currentPage.set(res.page + 1);
                this.totalPages.set(res.total_pages);
                this.totalElements.set(res.total_elements);

                if (res.content.length > 0) {
                    this.surveyTitle.set(res.content[0].survey_title);
                }

                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    onPageChange(page: number) {
        this.loadData(page);
    }

    onExport() {
        alert('匯出功能開發中 (Phase 6+ pre-feature)');
    }
}
