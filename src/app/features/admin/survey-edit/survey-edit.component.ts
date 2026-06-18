// ============================================
// 問卷編輯主組件
// ============================================
// 路徑：src/app/features/admin/survey-edit/survey-edit.component.ts
// 功能：管理問卷編輯的三步驟流程、資料載入與更新

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../core/services/survey.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateSurveyRequest, SurveyStatus, CreateQuestionRequest, SurveyDetail, UpdateSurveyRequest } from '../../../shared/models';

// 引入 Shared Components
import { SidebarComponent } from '../../../shared/components';

// 子元件 (來自 Shared)
import { StepInfoComponent, StepQuestionsComponent, StepPreviewComponent } from '../../../shared/components/survey-form';

@Component({
    selector: 'app-admin-survey-edit',
    standalone: true,
    imports: [
        CommonModule,
        SidebarComponent,
        StepInfoComponent,
        StepQuestionsComponent,
        StepPreviewComponent
    ],
    templateUrl: './survey-edit.component.html',
    styleUrls: ['./survey-edit.component.scss']
})
export class SurveyEditComponent implements OnInit {
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

    // 問卷資料 (與 create 使用相同格式)
    surveyData = signal<CreateSurveyRequest>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: SurveyStatus.NOT_STARTED,
        questions: []
    });

    ngOnInit(): void {
        // 從路由參數獲取問卷 ID
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.surveyId.set(parseInt(id, 10));
            this.loadSurveyData();
        } else {
            this.errorMessage.set('問卷 ID 不存在');
            this.isInitialLoading.set(false);
        }
    }

    /**
     * 載入現有問卷資料
     */
    private loadSurveyData(): void {
        this.isInitialLoading.set(true);
        this.errorMessage.set('');

        // 呼叫 GET /api/admin/surveys/{id}
        this.surveyService.getAdminSurveyDetail(this.surveyId()).subscribe({
            next: (response: SurveyDetail) => {
                // 轉換後端資料為前端格式
                const surveyData = this.convertApiToFrontend(response);
                this.surveyData.set(surveyData);

                // 與後端 validateCanModify 一致：只有「未開始」且「無回覆」才能編輯
                this.canEdit.set(
                    response.status === SurveyStatus.NOT_STARTED && response.response_count === 0
                );

                if (!this.canEdit()) {
                    this.errorMessage.set(
                        response.status !== SurveyStatus.NOT_STARTED
                            ? '問卷已發布，僅可檢視內容'
                            : '此問卷已有回覆，無法編輯'
                    );
                }

                this.isInitialLoading.set(false);
            },
            error: (err) => {
                console.error('載入問卷失敗：', err);
                this.errorMessage.set(err.error?.message || '載入問卷失敗');
                this.isInitialLoading.set(false);
            }
        });
    }

    /**
     * 轉換 API 資料為前端格式 (SurveyDetail -> CreateSurveyRequest)
     */
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

    // --- 事件處理 (與 create 相同邏輯) ---

    /**
     * Step 1 完成：更新基本資料 -> 去 Step 2
     */
    onBasicInfoSubmit(info: Partial<CreateSurveyRequest>) {
        if (!this.canEdit()) {
            this.notificationService.warning('此問卷已有回覆，無法編輯');
            return;
        }

        this.surveyData.update(current => ({
            ...current,
            ...info
        }));
        this.goToStep(2);
    }

    /**
     * Step 2 完成：更新題目列表 -> 去 Step 3
     */
    onQuestionsSubmit(questions: CreateQuestionRequest[]) {
        if (!this.canEdit()) {
            this.notificationService.warning('此問卷已有回覆，無法編輯');
            return;
        }

        this.surveyData.update(current => ({
            ...current,
            questions: questions
        }));
        this.goToStep(3);
    }

    /**
     * Step 3 完成：決定狀態 -> 呼叫 UPDATE API
     */
    onFinalSubmit(status: SurveyStatus) {
        if (!this.canEdit()) {
            this.notificationService.warning('此問卷已有回覆，無法編輯');
            return;
        }

        this.isLoading.set(true);

        // 準備最終 Payload
        const finalPayload: UpdateSurveyRequest = {
            ...this.surveyData(),
            status: status
        };

        // 呼叫 PUT API (更新問卷)
        this.surveyService.updateAdminSurvey(this.surveyId(), finalPayload).subscribe({
            next: () => {
                this.isLoading.set(false);
                const msg = status === SurveyStatus.ACTIVE ? '問卷已更新並發佈！' : '問卷已更新！';
                this.notificationService.success(msg);
                this.router.navigate(['/admin/surveys']);
            },
            error: (err) => {
                this.isLoading.set(false);
                console.error('Update failed', err);
                this.notificationService.error(err.error?.message || '更新失敗，請檢查資料或網路連線。');
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

    /**
     * 取消編輯
     */
    cancelEdit(): void {
        if (confirm('確定要取消編輯嗎？未儲存的變更將會遺失。')) {
            this.router.navigate(['/admin/surveys']);
        }
    }

    // 返回列表
    backToList(): void{
        this.router.navigate(['/admin/surveys']);
    }
}
