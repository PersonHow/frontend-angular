import { Injectable, signal, computed } from "@angular/core";
import { environment } from "../../../environments/env";

import {
    CurrentUser,
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    RegisterRequest,
    RegisterResponse,
    Role,

} from "../../shared/models";

import { API_ENDPOINTS, ROUTES, STORAGE_KEYS } from "../../shared/constants/app.constants";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";


@Injectable({
    providedIn: "root"
})

export class AuthService {
    private apiUrl = environment.apiUrl;

    private currentUserSignal = signal<CurrentUser | null>(null);

    // 憑證到期時間（epoch ms），供畫面顯示倒數
    private tokenExpiresAtSignal = signal<number | null>(null);
    readonly tokenExpiresAt = this.tokenExpiresAtSignal.asReadonly();

    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
    readonly isAdmin = computed(() => this.currentUserSignal()?.role === Role.ADMIN);
    readonly isMember = computed(() => this.currentUserSignal()?.role === Role.MEMBER);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadUserFromStorage();
    }


    // 登入
    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(
            `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
            request
        ).pipe(
            tap(response => this.handleLoginSuccess(response))
        );
    }

    // 註冊
    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(
            `${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
            request,
        );
    }

    // 登出
    logout(): void {
        this.cleanUserData();
        this.router.navigate([ROUTES.LOGIN]);
    }

// ============================= Token 方法 =============================

    // 取得 token
    getToken(): string | null {
        return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    // 檢查 token 期效
    hasValidToken(): boolean {
        const expiry = this.getTokenExpiry();
        return expiry !== null && Date.now() < expiry;
    }

    // 以仍有效的舊憑證換發新憑證，延長登入時間
    refreshToken(): Observable<RefreshTokenResponse> {
        return this.http.post<RefreshTokenResponse>(
            `${this.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
            {}
        ).pipe(
            tap(response => {
                sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
                this.tokenExpiresAtSignal.set(response.expires_at);

                const current = this.currentUserSignal();
                if (current) {
                    const updated: CurrentUser = { ...current, token: response.token };
                    this.currentUserSignal.set(updated);
                    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
                }
            })
        );
    }

    // 從 JWT payload 解析到期時間（epoch ms）
    private getTokenExpiry(): number | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000;
        } catch {
            return null;
        }
    }

// ============================= 角色方法 =============================

    // 導覽使用者至頁面
    navigateToHome(): void{
        const role = this.currentUserSignal()?.role;
        switch(true){
            case role === Role.ADMIN:
                this.router.navigate([ROUTES.ADMIN.SURVEYS]);
                return;
            case role === Role.MEMBER:
                this.router.navigate([ROUTES.PUBLIC.SURVEYS]);
                return
            default:
                this.router.navigate([ROUTES.PUBLIC.HOME]);
        }
    }

    // 檢查使用者有沒有任一種角色
    hasAnyRole(roles: Role[]): boolean{
        const userRole = this.currentUserSignal()?.role;
        return userRole ? roles.includes(userRole) : false;
    }

// 更新當前用戶資料（name/phone）並同步 sessionStorage
    updateCurrentUser(updates: Pick<CurrentUser, 'name' | 'phone'>): void {
        const current = this.currentUserSignal();
        if (current) {
            const updated: CurrentUser = { ...current, ...updates };
            this.currentUserSignal.set(updated);
            sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        }
    }

// ============================= 私有方法 =============================
    private loadUserFromStorage(): void {
        try {
            const userJSON = sessionStorage.getItem(STORAGE_KEYS.USER);
            const TOKEN = sessionStorage.getItem(STORAGE_KEYS.TOKEN);

            if (userJSON && TOKEN && this.hasValidToken()) {
                const user = JSON.parse(userJSON) as CurrentUser;
                this.currentUserSignal.set(user);
                this.tokenExpiresAtSignal.set(this.getTokenExpiry());
            } else {
                this.cleanUserData();
            }
        } catch {
            this.cleanUserData();
        }
    }

    private cleanUserData(): void {
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        this.currentUserSignal.set(null);
        this.tokenExpiresAtSignal.set(null);
    }

    private handleLoginSuccess(response: LoginResponse): void{
        const user: CurrentUser = {
            id: response.account_id,
            name: response.account_name,
            email: response.account_email,
            phone: response.account_phone,
            role: response.account_role,
            token: response.token
        };

        sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        this.currentUserSignal.set(user);
        this.tokenExpiresAtSignal.set(response.expires_at ?? this.getTokenExpiry());
    }
}
