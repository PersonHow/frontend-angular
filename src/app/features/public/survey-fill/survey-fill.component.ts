import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, 
    Validators, FormArray, FormControl } from '@angular/forms';
import { LucideAngularModule, Calendar, User, Phone, Mail, FileText, CheckCircle, AlertCircle } from 'lucide-angular';

import { SurveyService } from '../../../core/services/survey.service';
import { ResponseService } from '../../../core/services/response.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SurveyDetail, QuestionType, SubmitResponseRequest, 
    SubmitAnswerRequest, AccountSex } from '../../../shared/models';
import { VALIDATION } from '../../../shared/constants/app.constants';

@Component({
    selector: 'app-public-survey-fill',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
    templateUrl: './survey-fill.component.html',
    styleUrls: ['./survey-fill.component.scss']
})
export class SurveyFillComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private surveyService = inject(SurveyService);
    private responseService = inject(ResponseService);
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);
    private fb = inject(FormBuilder);

    // Icons
    readonly icons = { Calendar, User, Phone, Mail, FileText, CheckCircle, AlertCircle };
    readonly QuestionType = QuestionType;
    readonly AccountSex = AccountSex;

    // State
    surveyId = signal<number>(0);
    survey = signal<SurveyDetail | null>(null);
    isLoading = signal<boolean>(true);
    isSubmitting = signal<boolean>(false);
    errorMessage = signal<string>('');

    // 當前用戶狀態
    currentUser = this.authService.currentUser;
    isLoggedIn = this.authService.isLoggedIn;

    // 表單
    form!: FormGroup;

    ngOnInit() {
        // 1. 取得網址上的 ID
        this.route.paramMap.subscribe(params => {
            const id = Number(params.get('id'));
            if (id) {
                this.surveyId.set(id);
                this.loadSurvey(id);
            }
        });
    }

    loadSurvey(id: number) {
        this.isLoading.set(true);
        this.surveyService.getPublicSurveyDetail(id).subscribe({
            next: (data) => {
                this.survey.set(data);
                this.initForm(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.errorMessage.set('無法載入問卷，可能問卷不存在或已下架。');
                this.isLoading.set(false);
            }
        });
    }

    // 初始化表單結構
    initForm(survey: SurveyDetail) {
        const user = this.currentUser();

        // 1. 個資區塊 (如果是會員，預設帶入資料)
        const userInfoGroup = this.fb.group({
            response_name: [user?.name || '', [Validators.required]],
            response_email: [{ value: user?.email || '', disabled: !!user }, [Validators.required, Validators.email]], // 會員信箱通常不可改
            response_phone:[user?.phone || '', [Validators.required, Validators.pattern(/^[0-9\-]+$/)]],
            response_age: [''],
            response_sex: [AccountSex.MALE]
        });

        // 2. 答案區塊 (動態生成)
        const answersArray = this.fb.array([]);

        // 根據題目順序生成 FormControls
        survey.questions.forEach(q => {
            const validators = q.is_required ? [Validators.required] : [];

            let control: any;
            if (q.question_type === QuestionType.MULTIPLE) {
                // 多選題用 FormArray 存選中的 Option IDs
                control = this.fb.array([], q.is_required ? Validators.required : null);
            } else {
                // 單選或簡答用 FormControl
                control = this.fb.control('', validators);
            }

            answersArray.push(control);
        });

        // 3. 組合大表單
        this.form = this.fb.group({
            userInfo: userInfoGroup,
            answers: answersArray
        });
    }

    // --- Helper Getters ---
    get userInfo() { return this.form.get('userInfo') as FormGroup; }
    get answers() { return this.form.get('answers') as FormArray; }

    // 取得特定題目的 FormControl (用於 Template)
    getAnswerControl(index: number) {
        return this.answers.at(index);
    }

    // --- 多選題邏輯 (Checkbox) ---
    onCheckboxChange(e: any, questionIndex: number, optionId: number) {
        const formArray: FormArray = this.answers.at(questionIndex) as FormArray;

        if (e.target.checked) {
            // 勾選：加入 Option ID
            formArray.push(new FormControl(optionId));
        } else {
            // 取消勾選：移除 Option ID
            const i = formArray.controls.findIndex(x => x.value === optionId);
            if (i !== -1) formArray.removeAt(i);
        }

        // 觸發驗證更新
        formArray.markAsTouched();
    }

    // 檢查多選題是否已選中某選項 (用於回填樣式，雖然填寫頁通常是空的)
    isOptionChecked(questionIndex: number, optionId: number): boolean {
        const formArray = this.answers.at(questionIndex) as FormArray;
        return formArray.value.includes(optionId);
    }

    // --- 提交表單 ---
    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            // 滾動到第一個錯誤欄位 (簡單 UX 優化)
            const firstInvalid = document.querySelector('.ng-invalid');
            if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!confirm('確定要送出問卷嗎？送出後無法修改。')) return;

        this.isSubmitting.set(true);
        const survey = this.survey()!;
        const formVal = this.form.getRawValue(); // 使用 getRawValue 以包含 disabled 的 email

        // 1. 轉換答案格式
        const submitAnswers: SubmitAnswerRequest[] = survey.questions.map(
            (q, index): SubmitAnswerRequest | null => {
            const rawAnswer = formVal.answers[index];

            // 根據題型包裝
            if (q.question_type === QuestionType.SINGLE) {
                if(!rawAnswer && rawAnswer !== 0){
                    return null;
                }
                return {
                    question_id: q.id!,
                    option_ids: [Number(rawAnswer)], // 單選也包成陣列傳給後端 (視後端 DTO 定義，通常是 List<Long>)
                    text_answer: undefined
                };
            } else if (q.question_type === QuestionType.MULTIPLE) {
                if(!Array.isArray(rawAnswer) || rawAnswer.length == 0){
                    console.log("觸發 null");
                    
                    return null;
                }
                return {
                    question_id: q.id!,
                    option_ids: rawAnswer.map((id: any) => Number(id)),
                    text_answer: undefined
                };
            } else {
                if(!rawAnswer || (typeof rawAnswer === 'string' && rawAnswer.trim() === '')){
                    return null;
                }
                // TEXT
                return {
                    question_id: q.id!,
                    option_ids: [],
                    text_answer: rawAnswer
                };
            }
        })
        .filter((item): item is SubmitAnswerRequest => item !== null);

        // 2. 轉換 Payload
        const payload: SubmitResponseRequest = {
            response_name: formVal.userInfo.response_name,
            response_phone: formVal.userInfo.response_phone,
            response_email: formVal.userInfo.response_email,
            response_age: formVal.userInfo.response_age ? Number(formVal.userInfo.response_age) : undefined,
            response_sex: formVal.userInfo.response_sex,
            answers: submitAnswers
        };
        console.log(payload);
        console.log(formVal);
        
        // 3. 呼叫 API
        this.responseService.submitResponse(this.surveyId(), payload).subscribe({
            next: () => {
                this.notificationService.success('問卷提交成功！感謝您的填寫。');
                this.router.navigate(['/surveys']); // 回到列表頁
            },
            error: (err) => {
                console.error(err);
                this.isSubmitting.set(false);
                // 如果是重複填寫 (400/409)，後端通常會回傳錯誤訊息
                this.notificationService.error(err.error?.message || '提交失敗，請稍後再試。');
            }
        });
    }
}
