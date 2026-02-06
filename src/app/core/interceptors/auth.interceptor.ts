// ============================================
// 認證攔截器 - 自動注入 JWT Token
// ============================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    
    // 如果有 Token，則添加到請求頭
    if (authService.hasValidToken()) {
        const token = authService.getToken();
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
