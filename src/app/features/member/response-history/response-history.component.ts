import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileText, Clock, Eye, Calendar } from 'lucide-angular';

import { ResponseService } from '../../../core/services/response.service';
import { PaginationComponent, SidebarComponent } from '../../../shared/components';
import {ResponseListItem} from '../../../shared/models';


@Component({
    selector: 'app-response-history',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideAngularModule,
        PaginationComponent,
        SidebarComponent
    ],
    templateUrl: './response-history.component.html',
    styleUrl: './response-history.component.scss'
})
export class ResponseHistoryComponent implements OnInit {
    private responseService = inject(ResponseService);

    // Icons
    readonly icons = { FileText, Clock, Eye, Calendar };

    // 狀態
    responses = signal<ResponseListItem[]>([]);
    isLoading = signal(true);

    // 分頁
    currentPage = signal(1);
    totalPages = signal(0);
    totalElements = signal(0);
    pageSize = signal(10);

    ngOnInit() {
        this.loadData(1);
    }

    loadData(page: number) {
        this.isLoading.set(true);
        const params = {
            page: page - 1, // 0-based
            size: this.pageSize()
        };

        this.responseService.getMemberResponses(params.page, params.size).subscribe({
            next: (res) => {
                this.responses.set(res.content);
                this.currentPage.set(res.page + 1);
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

    onPageChange(page: number) {
        this.loadData(page);
    }
}
