import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CreateSurveyRequest, SurveyStatus, CreateQuestionRequest } from '../../../shared/models';

// 引入 Shared Components
import { SidebarComponent } from '../../../shared/components';

// 子元件
import { StepInfoComponent } from './components/step-info/step-info.component';
import { StepQuestionsComponent } from './components/step-questions/step-questions.component';
import { StepPreviewComponent } from './components/step-preview/step-preview.component';

@Component({
    selector: 'app-admin-survey-create',
    standalone: true,
    imports: [
        CommonModule,
        SidebarComponent,
        StepInfoComponent,
        StepQuestionsComponent,
        StepPreviewComponent
    ],
    templateUrl: './survey-create.component.html',
    styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent {
    private router = inject(Router);
    private apiService = inject(ApiService);

    // --- 狀態管理 ---
    currentStep = signal<number>(1);
    isLoading = signal<boolean>(false);

    // 問卷暫存資料 (隨時保持最新狀態)
    surveyData = signal<CreateSurveyRequest>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: SurveyStatus.NOT_STARTED,
        questions: []
    });

    // --- 事件處理 ---

    // Step 1 完成：更新基本資料 -> 去 Step 2
    onBasicInfoSubmit(info: Partial<CreateSurveyRequest>) {
        this.surveyData.update(current => ({
            ...current,
            ...info
        }));
        this.goToStep(2);
    }

    // Step 2 完成：更新題目列表 -> 去 Step 3
    onQuestionsSubmit(questions: CreateQuestionRequest[]) {
        this.surveyData.update(current => ({
            ...current,
            questions: questions
        }));
        this.goToStep(3);
    }

    // Step 3 完成：決定狀態 -> 呼叫 API
    onFinalSubmit(status: SurveyStatus) {
        this.isLoading.set(true);

        // 準備最終 Payload
        const finalPayload: CreateSurveyRequest = {
            ...this.surveyData(),
            status: status
        };

        // 呼叫 API (需確認 ApiService 有 createAdminSurvey 方法)
        // 注意：您之前提供的 api.service.ts 還沒補上 createAdminSurvey，
        // 請記得在 api.service.ts 補上對應的 POST 方法。
        this.apiService.createAdminSurvey(finalPayload).subscribe({
            next: () => {
                this.isLoading.set(false);
                const msg = status === SurveyStatus.ACTIVE ? '問卷已發佈！' : '問卷已暫存！';
                alert(msg); // 建議改用 Toast
                this.router.navigate(['/admin/surveys']);
            },
            error: (err) => {
                this.isLoading.set(false);
                console.error('Create failed', err);
                alert(err.error?.message || '建立失敗，請檢查資料或網路連線。');
            }
        });
    }

    // --- 導航輔助 ---

    goToStep(step: number) {
        this.currentStep.set(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 麵包屑導航點擊 (選用：可限制只能往回點)
    onStepClick(step: number) {
        if (step < this.currentStep()) {
            this.currentStep.set(step);
        }
    }
}
