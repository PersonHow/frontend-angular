import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../core/services/survey.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateSurveyRequest, SurveyStatus, CreateQuestionRequest, SurveyDetail, UpdateSurveyRequest } from '../../../shared/models';

// Shared Components
import { SidebarComponent } from '../../../shared/components';
import { StepInfoComponent, StepQuestionsComponent, StepPreviewComponent } from '../../../shared/components/survey-form';

@Component({
    selector: 'app-member-survey-edit',
    standalone: true,
    imports: [
        CommonModule,
        SidebarComponent,
        StepInfoComponent,
        StepQuestionsComponent,
        StepPreviewComponent
    ],
    templateUrl: './member-survey-edit.component.html',
    styleUrls: ['./member-survey-edit.component.scss']
})
export class MemberSurveyEditComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private surveyService = inject(SurveyService);
    private notificationService = inject(NotificationService);

    // --- 狀態管理 ---
    surveyId = signal<number>(0);
    currentStep = signal<number>(1);
    isLoading = signal<boolean>(false);
    isInitialLoading = signal<boolean>(true);
    errorMessage = signal<string>('');
    canEdit = signal<boolean>(true);

    surveyData = signal<CreateSurveyRequest>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: SurveyStatus.NOT_STARTED,
        questions: []
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.surveyId.set(parseInt(id, 10));
            this.loadSurveyData();
        } else {
            this.errorMessage.set('問卷 ID 不存在');
            this.isInitialLoading.set(false);
        }
    }

    private loadSurveyData(): void {
        this.isInitialLoading.set(true);
        this.errorMessage.set('');

        this.surveyService.getMemberSurveyDetail(this.surveyId()).subscribe({
            next: (response: SurveyDetail) => {
                this.surveyData.set(this.convertApiToFrontend(response));
                this.canEdit.set(response.response_count === 0);

                if (!this.canEdit()) {
                    this.errorMessage.set('此問卷已有回覆，無法編輯');
                }
                this.isInitialLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message || '載入問卷失敗');
                this.isInitialLoading.set(false);
            }
        });
    }

    private convertApiToFrontend(apiData: SurveyDetail): CreateSurveyRequest {
        return {
            title: apiData.title,
            description: apiData.description,
            start_date: apiData.start_date,
            end_date: apiData.end_date,
            status: apiData.status,
            questions: apiData.questions.map(q => ({
                question_text: q.question_text,
                question_type: q.question_type,
                is_required: q.is_required,
                question_order: q.question_order,
                options: q.options.map(opt => ({
                    option_text: opt.option_text,
                    option_order: opt.option_order
                }))
            }))
        };
    }

    onBasicInfoSubmit(info: Partial<CreateSurveyRequest>) {
        if (!this.canEdit()) {
            this.notificationService.warning('此問卷已有回覆，無法編輯');
            return;
        }
        this.surveyData.update(current => ({ ...current, ...info }));
        this.goToStep(2);
    }

    onQuestionsSubmit(questions: CreateQuestionRequest[]) {
        if (!this.canEdit()) {
            this.notificationService.warning('此問卷已有回覆，無法編輯');
            return;
        }
        this.surveyData.update(current => ({ ...current, questions }));
        this.goToStep(3);
    }

    onFinalSubmit(status: SurveyStatus) {
        if (!this.canEdit()) {
            this.notificationService.warning('此問卷已有回覆，無法編輯');
            return;
        }

        this.isLoading.set(true);

        const finalPayload: UpdateSurveyRequest = {
            ...this.surveyData(),
            status
        };

        this.surveyService.updateMemberSurvey(this.surveyId(), finalPayload).subscribe({
            next: () => {
                this.isLoading.set(false);
                const msg = status === SurveyStatus.ACTIVE ? '問卷已更新並發佈！' : '問卷已更新！';
                this.notificationService.success(msg);
                this.router.navigate(['/member/surveys']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.notificationService.error(err.error?.message || '更新失敗，請檢查資料或網路連線。');
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

    backToList(): void {
        this.router.navigate(['/member/surveys']);
    }
}
