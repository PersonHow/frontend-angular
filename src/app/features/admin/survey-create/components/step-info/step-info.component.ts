import { Component, input, output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CreateSurveyRequest } from '../../../../../shared/models'; // 請依實際路徑調整
import { VALIDATION } from '../../../../../shared/constants/app.constants';

@Component({
    selector: 'app-step-basic-info',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './step-info.component.html',
    styleUrls: ['./step-info.component.scss']
})
export class StepInfoComponent implements OnInit {
    private fb = inject(FormBuilder);

    // Inputs / Outputs
    initialData = input<Partial<CreateSurveyRequest>>({});
    stepSubmit = output<Partial<CreateSurveyRequest>>();

    readonly LIMITS = VALIDATION;

    form = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(VALIDATION.SURVEY_TITLE_MAX_LENGTH)]],
        description: ['', [Validators.maxLength(VALIDATION.SURVEY_DESCRIPTION_MAX_LENGTH)]],
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });

    get f() { return this.form.controls; }

    ngOnInit() {
        const data = this.initialData();
        if (data.title) {
            this.form.patchValue({
                title: data.title,
                description: data.description,
                start_date: data.start_date,
                end_date: data.end_date
            });
        }
    }

    // 自訂驗證：結束日期必須晚於開始日期
    dateRangeValidator(group: AbstractControl): ValidationErrors | null {
        const start = group.get('start_date')?.value;
        const end = group.get('end_date')?.value;
        return (start && end && new Date(start) > new Date(end)) ? { dateRangeInvalid: true } : null;
    }

    onNext() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.stepSubmit.emit(this.form.value as Partial<CreateSurveyRequest>);
    }
}
