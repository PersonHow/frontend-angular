// ============================================
// 認證守衛 - 檢查用戶是否已登入
// ============================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTES } from '../../shared/constants/app.constants';

/**
 * 需要登入才能訪問
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn() && authService.hasValidToken()) {
        return true;
    }

    // 保存目標 URL，登入後可以跳轉回去
    router.navigate([ROUTES.LOGIN], {
        queryParams: { returnUrl: state.url }
    });

    return false;
};

/**
 * 已登入用戶不能訪問（用於登入/註冊頁）
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        return true;
    }

    // 已登入，跳轉到對應首頁
    authService.navigateToHome();
    return false;
};
