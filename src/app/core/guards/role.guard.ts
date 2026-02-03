// ============================================
// 角色守衛 - 檢查用戶角色權限
// ============================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../shared/models';
import { ROUTES } from '../../shared/constants/app.constants';

/**
 * 創建角色守衛
 * @param allowedRoles 允許訪問的角色列表
 */
export function roleGuard(allowedRoles: Role[]): CanActivateFn {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        // 先檢查是否登入
        if (!authService.isLoggedIn()) {
            router.navigate([ROUTES.LOGIN], {
                queryParams: { returnUrl: state.url }
            });
            return false;
        }

        // 檢查角色權限
        if (authService.hasAnyRole(allowedRoles)) {
            return true;
        }

        // 沒有權限，跳轉到對應首頁
        console.warn('Access denied: User does not have required role');
        authService.navigateToHome();
        return false;
    };
}

/**
 * 管理員專用守衛
 */
export const adminGuard: CanActivateFn = roleGuard([Role.ADMIN]);

/**
 * 會員專用守衛
 */
export const memberGuard: CanActivateFn = roleGuard([Role.MEMBER]);

/**
 * 管理員或會員守衛
 */
export const adminOrMemberGuard: CanActivateFn = roleGuard([Role.ADMIN, Role.MEMBER]);
