import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, BarChart, PieChart, FileText, Users } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { ResponseService } from '../../../core/services/response.service';
import { StatisticsResponse, QuestionType } from '../../../shared/models';

@Component({
    selector: 'app-survey-statistics',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, BaseChartDirective], // 引入 BaseChartDirective
    templateUrl: './survey-statistics.component.html',
    styleUrls: ['./survey-statistics.component.scss']
})
export class SurveyStatisticsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private responseService = inject(ResponseService);
    private location = inject(Location);

    // Icons
    readonly icons = { ArrowLeft, BarChart, PieChart, FileText, Users };
    readonly QuestionType = QuestionType;

    // State
    stats = signal<StatisticsResponse | null>(null);
    isLoading = signal<boolean>(true);
    errorMessage = signal<string>('');

    // Chart Config (共用的圓餅圖設定)
    pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right', // 圖例放右邊
            },
        },
        aspectRatio: 2 // 調整長寬比
    };
    pieChartType: ChartType = 'pie';

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
        this.responseService.getAdminSurveyStatistics(id).subscribe({
            next: (data) => {
                this.stats.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('無法載入統計資料，可能尚無回覆。');
                this.isLoading.set(false);
            }
        });
    }

    goBack() {
        this.location.back();
    }

    // --- Helper: 產生圖表數據 ---
    getChartData(qStats: any): ChartData<'pie', number[], string | string[]> {
        if (!qStats.option_statistics) return { labels: [], datasets: [] };

        const labels = qStats.option_statistics.map((opt: any) => opt.option_text);
        const data = qStats.option_statistics.map((opt: any) => opt.count);

        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#C9CBCF', '#FF6384', '#4BC0C0', '#FF9F40' // 預設 10 色循環
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#C9CBCF', '#FF6384', '#4BC0C0', '#FF9F40'
                ]
            }]
        };
    }
}
