// ============================================
// 認證攔截器 - 自動注入 JWT Token 與處理過期
// ============================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router); // 注入 Router 用來跳轉頁面
    
    // 1. 如果有 Token，則添加到請求頭 (你原本寫的邏輯)
    let authReq = req;
    if (authService.hasValidToken()) {
        const token = authService.getToken();
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // 2. 發送請求，並監聽後端回傳的結果
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // 如果後端回傳 401 Unauthorized (代表 Token 過期或無效)
            if (error.status === 401) {
                console.warn('Token 已過期，強制登出');
                alert('登入已過期，請重新登入！'); // 可以換成你的專案設計的 Toast 提示
                
                // 清空儲存的 Token (這取決於你 AuthService 裡面的方法名稱，通常叫 logout 或 clearToken)
                authService.logout(); 
                
                // 強制跳轉回登入頁
                router.navigate(['/login']);
            }
            
            // 將錯誤繼續往外拋，讓組件也能處理 (例如顯示 "連線失敗")
            return throwError(() => error);
        })
    );
};
