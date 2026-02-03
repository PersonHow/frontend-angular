// 會員身份
export enum Role {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER'
}

// 會員性別
export enum AccountSex {
    MALE = 'MALE',
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}

// 登入請求
export interface LoginRequest {
    email: string,
    password: string
}

// 登入響應
export interface LoginResponse {
    token: string,
    account_id: number,
    account_name: string,
    account_email: string,
    account_phone: string,
    role: Role
}

// 註冊請求
export interface RegisterRequest {
    name: string,
    email: string,
    password: string,
    phone: string,
    sex: AccountSex
}

// 註冊回應
export interface RegisterResponse {
    account_id: number,
    account_name: string,
    account_email: string,
    message: string
}

// === 當前用戶資訊（存儲在本地） ===
export interface CurrentUser {
    id: number;
    name: string;
    email: string;
    phone:string;
    role: Role;
    token: string;
}

// === 會員資料響應 ===
export interface MemberProfileResponse {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    sex: AccountSex;
}

// === 更新會員資料請求 ===
export interface UpdateMemberProfileRequest {
    name?: string;
    new_password?: string;
    phone?: string;
}
