import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, Clock, User, FileText } from 'lucide-angular';

import { ApiService } from '../../../core/services/api.service';
import { ResponseDetail,QuestionType } from '../../../shared/models';

@Component({
    selector: 'app-response-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideAngularModule
    ],
    templateUrl: './response-detail.component.html',
    styleUrl: './response-detail.component.scss'
})
export class ResponseDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private apiService = inject(ApiService);

    // Icons
    readonly icons = { ArrowLeft, Calendar, Clock, User, FileText };
    readonly QuestionType = QuestionType;

    // 狀態
    response = signal<ResponseDetail | null>(null);
    isLoading = signal(true);
    errorMessage = signal('');

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id) {
                this.loadData(id);
            } else {
                this.errorMessage.set('無效的紀錄編號');
                this.isLoading.set(false);
            }
        });
    }

    loadData(id: number) {
        this.isLoading.set(true);
        this.apiService.getMemberResponseDetail(id).subscribe({
            next: (data) => {
                this.response.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('無法載入紀錄，可能該紀錄不存在或您無權查看。');
                this.isLoading.set(false);
            }
        });
    }

    // Helper: 格式化多選題答案 (將陣列轉為字串)
    formatOptions(options: string[] | null | undefined): string {
        return options ? options.join('、') : '';
    }
}
