import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSurveyRequest, QuestionType, SurveyStatus } from '../../../../../shared/models';
import { LucideAngularModule, Edit, FileText, Calendar, CheckCircle, Save } from 'lucide-angular';

@Component({
    selector: 'app-step-preview',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './step-preview.component.html',
    styleUrls: ['./step-preview.component.scss']
})
export class StepPreviewComponent {
    // Inputs
    surveyData = input.required<CreateSurveyRequest>();

    // Outputs
    submit = output<SurveyStatus>();
    editStep = output<number>();

    // Enums for Template
    readonly QuestionType = QuestionType;
    readonly SurveyStatus = SurveyStatus;

    // Icons
    readonly icons = { Edit, FileText, Calendar, CheckCircle, Save };

    onSave(status: SurveyStatus) {
        // 簡單的確認
        if (status === SurveyStatus.ACTIVE) {
            if (!confirm('確定要發佈問卷嗎？發佈後將開放填寫。')) return;
        }
        this.submit.emit(status);
    }
}
