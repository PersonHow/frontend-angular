// ============================================
// 應用常數配置
// ============================================

// === API 端點 ===
export const API_ENDPOINTS = {
    // 認證
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register'
    },

    // 管理員 - 問卷管理
    ADMIN: {
        SURVEYS: '/admin/surveys',
        CREATE_SURVEY:'/admin/surveys/createSurvey',
        ACCOUNTS:'/admin/accounts',
        ACCOUNT_DETAIL:(id: number) => `/admin/accounts/${id}`,
        SURVEY_DETAIL: (id: number) => `/admin/surveys/${id}`,
        SURVEY_RESPONSES: (id: number) => `/admin/surveys/${id}/responses`,
        SURVEY_STATISTICS: (id: number) => `/admin/surveys/${id}/statistics`,
        RESPONSE_DETAIL: (id: number) => `/admin/responses/${id}`
    },

    // 會員 - 問卷管理
    MEMBER: {
        SURVEYS: '/member/surveys',
        CREATE_SURVEY:'/member/surveys/createSurvey',
        SURVEY_DETAIL: (id: number) => `/member/surveys/${id}`,
        RESPONSES: '/member/responses',
        RESPONSE_DETAIL: (id: number) => `/member/responses/${id}`,
        PROFILE: '/account/profile'
    },

    // 公開
    PUBLIC: {
        SURVEYS: '/public/surveys',
        SURVEY_DETAIL: (id: number) => `/public/surveys/${id}`,
        SURVEY_STATISTICS: (id: number) => `/public/surveys/${id}/statistics`,
        SUBMIT_RESPONSE: (id: number) => `/public/surveys/${id}/responses`
    }
} as const;

// === 路由路徑 ===
export const ROUTES = {
    // 認證
    LOGIN: '/login',
    REGISTER: '/register',

    // 管理員
    ADMIN: {
        HOME: '/admin',
        SURVEYS: '/admin/surveys',
        SURVEY_CREATE: '/admin/surveys/create',
        SURVEY_DETAIL: (id: number) => `/admin/surveys/${id}`,
        SURVEY_EDIT: (id: number) => `/admin/surveys/${id}/edit`,
        SURVEY_RESULTS: (id: number) => `/admin/surveys/${id}/results`,
        RESPONSE_DETAIL: (id: number) => `/admin/responses/${id}`
    },

    // 會員
    MEMBER: {
        HOME: '/member',
        SURVEYS: '/member/surveys',
        SURVEY_CREATE: '/member/surveys/create',
        SURVEY_EDIT: (id: number) => `/member/surveys/${id}/edit`,
        RESPONSES: '/member/responses',
        RESPONSE_DETAIL: (id: number) => `/member/responses/${id}`,
        PROFILE: '/member/profile'
    },

    // 公開
    PUBLIC: {
        HOME: '/',
        SURVEYS: '/surveys',
        SURVEY_FILL: (id: number) => `/surveys/${id}/fill`,
        SURVEY_CONFIRM: (id: number) => `/surveys/${id}/confirm`
    }
} as const;

// === 本地存儲鍵 ===
export const STORAGE_KEYS = {
    TOKEN: 'survey_token',
    USER: 'survey_user',
    REMEMBER_EMAIL: 'survey_remember_email'
} as const;

// === 分頁配置 ===
export const PAGINATION = {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
} as const;

// === 驗證規則 ===
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 12,
    SURVEY_TITLE_MAX_LENGTH: 50,
    SURVEY_DESCRIPTION_MAX_LENGTH: 300,
    QUESTION_TEXT_MAX_LENGTH: 75,
    OPTION_TEXT_MAX_LENGTH: 30,
    MIN_OPTIONS_COUNT: 2
} as const;

// === 日期格式 ===
export const DATE_FORMAT = {
    DISPLAY: 'yyyy-MM-dd',
    API: 'yyyy-MM-dd',
    DATETIME_DISPLAY: 'yyyy-MM-dd HH:mm'
} as const;

// === HTTP 狀態碼 ===
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
} as const;

// === 錯誤訊息 ===
export const ERROR_MESSAGES = {
    NETWORK_ERROR: '網路連線錯誤，請檢查網路狀態',
    UNAUTHORIZED: '登入已過期，請重新登入',
    FORBIDDEN: '您沒有權限執行此操作',
    NOT_FOUND: '找不到請求的資源',
    SERVER_ERROR: '伺服器錯誤，請稍後再試',
    VALIDATION_ERROR: '請檢查輸入的資料是否正確',
    UNKNOWN_ERROR: '發生未知錯誤',
    REGISTER_FAILED:"註冊失敗，請重新註冊",
    // 輸入相關
    NAME_REQUIRED: '請輸入姓名',
    EMAIL_REQUIRED: '請輸入信箱',
    PASSWORD_REQUIRED: '請輸入密碼',
    PHONE_REQUIRED: '請輸入電話',
    SEX_REQUIRED: '請輸入性別',


} as const;

// === 成功訊息 ===
export const SUCCESS_MESSAGES = {
    LOGIN: '登入成功',
    REGISTER: '註冊成功，請登入',
    LOGOUT: '已登出',
    SURVEY_CREATED: '問卷建立成功',
    SURVEY_UPDATED: '問卷更新成功',
    SURVEY_DELETED: '問卷刪除成功',
    RESPONSE_SUBMITTED: '問卷提交成功',
    PROFILE_UPDATED: '個人資料更新成功'
} as const;
