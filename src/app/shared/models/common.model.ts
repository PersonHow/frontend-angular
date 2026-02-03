// ============================================
// 通用模型
// ============================================

// === 分頁響應 ===
export interface PageResponse<T> {
    content: T[];
    page_number: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    is_first: boolean;
    is_last: boolean;
}

// === API 錯誤響應 ===
export interface ApiError {
    error: string;
    message?: string;
    status?: number;
    timestamp?: string;
}

// === 通用響應 ===
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// === 下拉選項 ===
export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
}

// === 表格列定義 ===
export interface TableColumn {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

// === 確認對話框配置 ===
export interface ConfirmDialogConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}

// === Toast 通知 ===
export interface ToastMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
