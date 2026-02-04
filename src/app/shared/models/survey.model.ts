// ============================================
// 問卷相關模型
// ============================================

// === 問卷狀態 ===
export enum SurveyStatus {
    NOT_STARTED = 'NOT_STARTED',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED'
}

// === 題目類型 ===
export enum QuestionType {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE',
    TEXT = 'TEXT'
}

// === 問卷列表項 ===
export interface SurveyListItem {
    id: number;
    title: string;
    status: SurveyStatus;
    start_date: string;
    end_date: string;
    response_count: number;
    created_at?: string;
}

// === 問卷搜尋請求 ===
export interface SurveySearchRequest {
    title?: string;
    status?: SurveyStatus;
    start_date?: string;
    end_date?: string;
    page?: number;
    size?: number;
}

// === 選項 ===
export interface QuestionOption {
    id?: number;
    option_text: string;
    option_order: number;
}

// === 題目 ===
export interface SurveyQuestion {
    id?: number;
    question_text: string;
    question_type: QuestionType;
    is_required: boolean;
    question_order: number;
    options: QuestionOption[];
}

// === 問卷詳情 ===
export interface SurveyDetail {
    id: number;
    title: string;
    description: string;
    status: SurveyStatus;
    start_date: string;
    end_date: string;
    created_by_id: number;
    created_by_name: string;
    response_count: number;
    questions: SurveyQuestion[];
    created_at?: string;
    updated_at?: string;
}

// === 創建問卷請求 ===
export interface CreateSurveyRequest {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status:string;
    questions: CreateQuestionRequest[];
}

// === 創建題目請求 ===
export interface CreateQuestionRequest {
    question_text: string;
    question_type: QuestionType;
    is_required: boolean;
    question_order: number;
    options: CreateOptionRequest[];
}

// === 創建選項請求 ===
export interface CreateOptionRequest {
    option_text: string;
    option_order: number;
}

// === 更新問卷請求 ===
export interface UpdateSurveyRequest {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status?: SurveyStatus;
    questions: UpdateQuestionRequest[];
}

// === 更新題目請求 ===
export interface UpdateQuestionRequest {
    id?: number;
    question_text: string;
    question_type: QuestionType;
    is_required: boolean;
    question_order: number;
    options: UpdateOptionRequest[];
}

// === 更新選項請求 ===
export interface UpdateOptionRequest {
    id?: number;
    option_text: string;
    option_order: number;
}

// === 問卷狀態顯示配置 ===
export const SURVEY_STATUS_CONFIG: Record<SurveyStatus, { label: string; cssClass: string }> = {
    [SurveyStatus.NOT_STARTED]: { label: '未開始', cssClass: 'status-not-started' },
    [SurveyStatus.ACTIVE]: { label: '進行中', cssClass: 'status-active' },
    [SurveyStatus.CLOSED]: { label: '已結束', cssClass: 'status-closed' }
};

// === 題目類型顯示配置 ===
export const QUESTION_TYPE_CONFIG: Record<QuestionType, { label: string }> = {
    [QuestionType.SINGLE]: { label: '單選' },
    [QuestionType.MULTIPLE]: { label: '多選' },
    [QuestionType.TEXT]: { label: '簡答' }
};
