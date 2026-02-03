// ============================================
// 回覆相關模型
// ============================================

import { AccountSex } from './auth.model';
import { QuestionType } from './survey.model';

// === 回覆列表項 ===
export interface ResponseListItem {
    response_id: number;
    survey_id: number;
    survey_title: string;
    respondent_name: string;
    respondent_phone?: string;
    respondent_email?: string;
    submitted_at: string;
}

// === 答案詳情 ===
export interface AnswerDetail {
    question_id: number;
    question_text: string;
    question_type: QuestionType;
    question_order: number;
    is_required: boolean;
    selected_options: string[] | null;
    text_answer: string | null;
}

// === 回覆詳情 ===
export interface ResponseDetail {
    response_id: number;
    survey_id: number;
    survey_title: string;
    survey_description: string;
    start_date: string;
    end_date: string;
    respondent_name: string;
    respondent_phone?: string;
    respondent_email?: string;
    respondent_age?: number;
    respondent_sex?: AccountSex;
    submitted_at: string;
    answers: AnswerDetail[];
}

// === 提交問卷請求 ===
export interface SubmitResponseRequest {
    response_name: string;
    response_phone: string;
    response_email: string;
    response_age?: number;
    response_sex?: AccountSex;
    answers: SubmitAnswerRequest[];
}

// === 提交答案請求 ===
export interface SubmitAnswerRequest {
    question_id: number;
    option_ids?: number[];
    text_answer?: string | null;
}

// === 提交問卷響應 ===
export interface SubmitResponseResponse {
    response_id: number;
    survey_id: number;
    survey_title: string;
    submitted_at: string;
    message: string;
}

// === 統計結果 ===
export interface StatisticsResponse {
    survey_id: number;
    survey_title: string;
    total_responses: number;
    question_statistics: QuestionStatistics[];
}

// === 題目統計 ===
export interface QuestionStatistics {
    question_id: number;
    question_text: string;
    question_type: QuestionType;
    question_order: number;
    option_statistics: OptionStatistics[] | null;
    text_answers: string[] | null;
}

// === 選項統計 ===
export interface OptionStatistics {
    option_id: number;
    option_text: string;
    option_order: number;
    count: number;
    percentage: number;
}
