import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, User, Calendar, Mail, Phone, FileText } from 'lucide-angular';

import { ResponseService } from '../../../core/services/response.service';
import { ResponseDetail, QuestionType } from '../../../shared/models';

@Component({
    selector: 'app-response-detail',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, RouterLink],
    templateUrl: './response-detail.component.html',
    styleUrls: ['./response-detail.component.scss']
})
export class ResponseDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private responseService = inject(ResponseService);
    private location = inject(Location);

    // Icons
    readonly icons = { ArrowLeft, User, Calendar, Mail, Phone, FileText };
    readonly QuestionType = QuestionType;

    // State
    response = signal<ResponseDetail | null>(null);
    isLoading = signal<boolean>(true);
    errorMessage = signal<string>('');

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id) {
                this.loadData(id);
            }
        });
    }

    loadData(id: number) {
        this.isLoading.set(true);
        this.responseService.getAdminResponseDetail(id).subscribe({
            next: (data) => {
                this.response.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('無法載入回覆詳情，可能資料不存在。');
                this.isLoading.set(false);
            }
        });
    }

    // 返回上一頁 (通常是列表頁)
    goBack() {
        this.location.back();
    }
}
