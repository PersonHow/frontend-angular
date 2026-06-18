// ============================================
// 認證攔截器 - 自動注入 JWT Token 與處理過期
// ============================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // 只負責注入 JWT Token；401 的處理統一交給 errorInterceptor
    if (authService.hasValidToken()) {
        const token = authService.getToken();
        return next(req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        }));
    }

    return next(req);
};
