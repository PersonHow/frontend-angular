import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SurveyService } from '../../../core/services/survey.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateSurveyRequest, SurveyStatus, CreateQuestionRequest } from '../../../shared/models';

// Shared Components
import { SidebarComponent } from '../../../shared/components';
import { StepInfoComponent, StepQuestionsComponent, StepPreviewComponent } from '../../../shared/components/survey-form';

@Component({
    selector: 'app-member-survey-create',
    standalone: true,
    imports: [
        CommonModule,
        SidebarComponent,
        StepInfoComponent,
        StepQuestionsComponent,
        StepPreviewComponent
    ],
    templateUrl: './member-survey-create.component.html',
    styleUrls: ['./member-survey-create.component.scss']
})
export class MemberSurveyCreateComponent {
    private router = inject(Router);
    private surveyService = inject(SurveyService);
    private notificationService = inject(NotificationService);

    // --- 狀態管理 ---
    currentStep = signal<number>(1);
    isLoading = signal<boolean>(false);

    surveyData = signal<CreateSurveyRequest>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: SurveyStatus.NOT_STARTED,
        questions: []
    });

    // --- 事件處理 ---

    onBasicInfoSubmit(info: Partial<CreateSurveyRequest>) {
        this.surveyData.update(current => ({ ...current, ...info }));
        this.goToStep(2);
    }

    onQuestionsSubmit(questions: CreateQuestionRequest[]) {
        this.surveyData.update(current => ({ ...current, questions }));
        this.goToStep(3);
    }

    onFinalSubmit(status: SurveyStatus) {
        this.isLoading.set(true);

        const finalPayload: CreateSurveyRequest = {
            ...this.surveyData(),
            status
        };

        this.surveyService.createMemberSurvey(finalPayload).subscribe({
            next: () => {
                this.isLoading.set(false);
                const msg = status === SurveyStatus.ACTIVE ? '問卷已發佈！' : '問卷已暫存！';
                this.notificationService.success(msg);
                this.router.navigate(['/member/surveys']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.notificationService.error(err.error?.message || '建立失敗，請檢查資料或網路連線。');
            }
        });
    }

    goToStep(step: number) {
        this.currentStep.set(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onStepClick(step: number) {
        if (step < this.currentStep()) {
            this.currentStep.set(step);
        }
    }
}
