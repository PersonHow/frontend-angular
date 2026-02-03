import { Injectable, signal, computed } from "@angular/core";
import { environment } from "../../../environments/env";

import {
    CurrentUser,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    Role,

} from "../../shared/models";

import { API_ENDPOINTS, ROUTES, STORAGE_KEYS } from "../../shared/constants/app.constants";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, Observable, tap, throwError } from "rxjs";


@Injectable({
    providedIn: "root"
})

export class AuthService {
    private apiUrl = environment.apiUrl;

    private currentUserSignal = signal<CurrentUser | null>(null);

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
            tap(response => this.handleLoginSuccess(response)),
            catchError(error => this.handleError(error))
        );
    }

    // 註冊
    register(request: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(
            `${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
            request
        ).pipe(
            catchError(error => this.handleError(error))
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
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    // 檢查 token 期效
    hasValidToken(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            return Date.now() < expiry;
        } catch {
            return false;
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

    // 檢查使用者有沒有指定角色
    hasRole(role: Role): boolean{
        return this.currentUserSignal()?.role === role
    }
    
    // 檢查使用者有沒有任一種角色
    hasAnyRole(roles: Role[]): boolean{
        const userRole = this.currentUserSignal()?.role;
        return userRole ? roles.includes(userRole) : false;
    }

// ============================= 私有方法 =============================
    private loadUserFromStorage(): void {
        try {
            const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
            const TOKEN = localStorage.getItem(STORAGE_KEYS.TOKEN);

            if (userJSON && TOKEN && this.hasValidToken()) {
                const user = JSON.parse(userJSON) as CurrentUser;
                this.currentUserSignal.set(user);
            } else {
                this.cleanUserData();
            }
        } catch {
            this.cleanUserData();
        }
    }

    private cleanUserData(): void {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        this.currentUserSignal.set(null);
    }

    private handleLoginSuccess(response: LoginResponse): void{
        const user: CurrentUser = {
            id: response.account_id,
            name: response.account_name,
            email: response.account_email,
            phone: response.account_phone,
            role: response.role,
            token: response.token
        };

        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        this.currentUserSignal.set(user);
    }

    private handleError(error: any): Observable<never> {
        
        if( error.status === 401){
            this.cleanUserData()
        }
        return throwError(() => error);
    }
}
