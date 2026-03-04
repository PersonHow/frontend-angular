import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CreateQuestionRequest, QuestionType } from '../../../models';
import { VALIDATION } from '../../../constants/app.constants';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LucideAngularModule, Trash2, Edit, Plus, ArrowLeft, ArrowRight } from 'lucide-angular';

// 擴充模型：前端需要 tempId 來操作尚未存入 DB 的題目
interface QuestionUI extends CreateQuestionRequest {
    tempId: string;
}

@Component({
    selector: 'app-step-questions',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ConfirmDialogComponent],
    templateUrl: './step-questions.component.html',
    styleUrls: ['./step-questions.component.scss']
})
export class StepQuestionsComponent {
    private fb = inject(FormBuilder);

    readonly LIMITS = VALIDATION;
    readonly QuestionType = QuestionType;
    readonly icons = { Trash2, Edit, Plus, ArrowLeft, ArrowRight };

    // Inputs / Outputs
    initialQuestions = input<CreateQuestionRequest[]>([]);
    stepSubmit = output<CreateQuestionRequest[]>();
    prevStep = output<void>();

    // State
    questionsList = signal<QuestionUI[]>([]);
    isEditing = signal<boolean>(false);
    editingTempId = signal<string | null>(null);

    // Dialog State
    showDeleteDialog = signal(false);
    deleteTargetId = signal<string | null>(null);

    // Form Definition
    questionForm = this.fb.group({
        question_text: ['', [Validators.required, Validators.maxLength(VALIDATION.QUESTION_TEXT_MAX_LENGTH)]],
        question_type: [QuestionType.SINGLE, Validators.required],
        is_required: [false],
        options: this.fb.array([])
    });

    constructor() {
        // 當題目類型改變時，若是簡答題則清空選項，否則預設給兩個選項
        this.questionForm.get('question_type')?.valueChanges.subscribe(type => {
            const currentOptionsLength = this.optionsArray.length;

            if (type === QuestionType.TEXT) {
                console.log("切換簡答");

                this.optionsArray.clear();
                return
            }

            if (type === QuestionType.SINGLE || type === QuestionType.MULTIPLE) {

                // 避免單選 -> 多選，選項壞掉
                if (currentOptionsLength === 0) {
                    console.log("切換選項");
                    this.addOption();
                    this.addOption();
                }
            }
        });
    }

    ngOnInit() {
        // 初始化：若有之前的資料 (Input)，轉成帶有 tempId 的格式
        if (this.initialQuestions().length > 0) {
            const uiQuestions = this.initialQuestions().map(q => ({
                ...q,
                tempId: crypto.randomUUID()
            }));
            this.questionsList.set(uiQuestions);
        } else {
            // 預設初始化
            this.addOption();
            this.addOption();
        }
    }

    // --- Options Helper ---
    get optionsArray() { return this.questionForm.get('options') as FormArray; }

    addOption(optionVal?: string) {
        this.optionsArray.push(this.fb.group({
            option_text: [optionVal, [Validators.required, Validators.maxLength(VALIDATION.OPTION_TEXT_MAX_LENGTH)]]
        }));
    }

    removeOption(index: number) {
        if (this.optionsArray.length > 2) {
            this.optionsArray.removeAt(index);
        }
    }

    // --- CRUD Actions ---

    saveQuestion() {
        this.questionForm.markAllAsTouched();
        this.optionsArray.controls.forEach((control) => {
            control.markAllAsTouched();
        })

        if (this.questionForm.invalid) {
            console.log("表單驗證失敗：{}", this.questionForm.errors);
            console.log("選項狀態：{}", this.optionsArray.value);
            return;
        }

        const val = this.questionForm.value;
        const type = val.question_type as QuestionType;

        const currentQuestionText = val.question_text?.trim();

        const isQuestionHad = this.questionsList().some(q => {
            return q.question_text === currentQuestionText
                && q.tempId !== (this.isEditing() ? this.editingTempId : '')
        })

        if (isQuestionHad && !this.isEditing()) {
            console.log("問題已重複");
            return
        }

        const notTEXT = type === QuestionType.SINGLE || type === QuestionType.MULTIPLE;

        const newQuestion: QuestionUI = {
            tempId: this.isEditing() ? this.editingTempId()! : crypto.randomUUID(),
            question_text: val.question_text!,
            question_type: type,
            is_required: val.is_required ?? false,
            question_order: 0, // 提交前再統一重算
            options: notTEXT ? (val.options as any[]).map((opt, idx) => ({
                option_text: opt.option_text,
                option_order: idx + 1
            })) : []
        };

        this.questionsList.update(list => {

            if (this.isEditing()) {
                return list.map(q => q.tempId === newQuestion.tempId ? newQuestion : q);
            }
            return [...list, newQuestion];
        });

        this.resetForm();
    }

    editQuestion(q: QuestionUI) {
        this.isEditing.set(true);
        this.editingTempId.set(q.tempId);

        this.questionForm.patchValue({
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
        }, { emitEvent: false });

        // 清空並回填選項
        this.optionsArray.clear();

        if (q.options.length > 0) {
            setTimeout(() => {
                q.options.forEach(opt => {
                    this.addOption(opt.option_text)
                    console.log(opt);

                })
            }, 0)

        }


    }

    // 刪除相關
    confirmDelete(tempId: string) {
        this.deleteTargetId.set(tempId);
        this.showDeleteDialog.set(true);
    }

    executeDelete() {
        const id = this.deleteTargetId();
        if (id) {
            this.questionsList.update(list => list.filter(q => q.tempId !== id));
            if (this.isEditing() && this.editingTempId() === id) {
                this.resetForm();
            }
        }
        this.showDeleteDialog.set(false);
    }

    resetForm() {
        this.isEditing.set(false);
        this.editingTempId.set(null);

        // emitEvent -> false
        // 避免觸發 constructor 的 valuesChange 機制
        this.questionForm.reset({
            question_type: QuestionType.SINGLE,
            is_required: false,
            question_text: ""
        },
            { emitEvent: false }
        );

        this.optionsArray.clear();

        setTimeout(() => {
            const currentType = this.questionForm.get('question_type')?.value;
            if (currentType === QuestionType.SINGLE || currentType === QuestionType.MULTIPLE) {
                this.addOption();
                this.addOption();
            }
        }, 0);
    }

    onNext() {
        if (this.questionsList().length === 0) {
            alert('請至少新增一個題目');
            return;
        }

        // 移除 tempId 並重算 order (1-based)
        const finalQuestions: CreateQuestionRequest[] = this.questionsList().map((q, idx) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: q.is_required,
            question_order: idx + 1,
            options: q.options
        }));

        this.stepSubmit.emit(finalQuestions);
    }
}
