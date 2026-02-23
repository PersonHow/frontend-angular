// ============================================
// 錯誤攔截器 - 統一處理 HTTP 錯誤
// ============================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ROUTES, ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constants/app.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const notificationService = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;

            if (error.error instanceof ErrorEvent) {
                // 客戶端錯誤
                errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
            } else {
                // 伺服器錯誤
                switch (error.status) {
                    case HTTP_STATUS.UNAUTHORIZED:
                        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
                        // 清除用戶數據並跳轉到登入頁
                        authService.logout();
                        break;

                    case HTTP_STATUS.FORBIDDEN:
                        errorMessage = ERROR_MESSAGES.FORBIDDEN;
                        break;

                    case HTTP_STATUS.NOT_FOUND:
                        errorMessage = ERROR_MESSAGES.NOT_FOUND;
                        break;

                    case HTTP_STATUS.BAD_REQUEST:
                        // 嘗試從響應中獲取錯誤訊息
                        errorMessage = error.error?.error || error.error?.message || ERROR_MESSAGES.VALIDATION_ERROR;
                        break;

                    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
                        break;

                    case 0:
                        // 網路錯誤（無法連接到伺服器）
                        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
                        break;

                    default:
                        errorMessage = error.error?.error || error.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
                }
            }

            // 可以在這裡添加 Toast 通知
            notificationService.error(errorMessage);
            console.error('HTTP Error:', errorMessage, error);

            return throwError(() => ({
                status: error.status,
                message: errorMessage,
                originalError: error
            }));
        })
    );
};
