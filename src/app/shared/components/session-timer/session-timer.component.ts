import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { LucideAngularModule, RefreshCw, TimerReset } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

// 剩餘時間低於此值時提醒使用者刷新憑證
const WARNING_THRESHOLD_MS = 5 * 60 * 1000;

@Component({
    selector: 'app-session-timer',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './session-timer.component.html',
    styleUrl: './session-timer.component.scss'
})
export class SessionTimerComponent implements OnDestroy {
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);

    readonly icons = { TimerReset, RefreshCw };

    isRefreshing = signal(false);

    private now = signal(Date.now());
    private intervalId = setInterval(() => this.now.set(Date.now()), 1000);

    // 是否已對「即將到期」提醒過（每次刷新後重置）
    private hasWarned = false;

    remainingMs = computed(() => {
        const expiresAt = this.authService.tokenExpiresAt();
        if (expiresAt === null) {
            return null;
        }
        return Math.max(0, expiresAt - this.now());
    });

    remainingLabel = computed(() => {
        const ms = this.remainingMs();
        if (ms === null) {
            return '';
        }
        const totalSec = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    });

    isExpiringSoon = computed(() => {
        const ms = this.remainingMs();
        return ms !== null && ms <= WARNING_THRESHOLD_MS;
    });

    constructor() {
        effect(() => {
            const ms = this.remainingMs();
            if (ms === null) {
                this.hasWarned = false;
                return;
            }

            if (ms <= 0) {
                this.notificationService.error('登入憑證已到期，請重新登入');
                this.authService.logout();
                return;
            }

            if (ms <= WARNING_THRESHOLD_MS && !this.hasWarned) {
                this.hasWarned = true;
                this.notificationService.warning('登入憑證即將到期，點擊側欄的刷新按鈕可延長登入時間', 8000);
            }
        });
    }

    refresh(): void {
        if (this.isRefreshing()) {
            return;
        }

        this.isRefreshing.set(true);
        this.authService.refreshToken().subscribe({
            next: () => {
                this.isRefreshing.set(false);
                this.hasWarned = false;
                this.notificationService.success('憑證已刷新，登入時間已延長');
            },
            error: () => {
                this.isRefreshing.set(false);
                this.notificationService.error('刷新憑證失敗，請重新登入');
            }
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }
}
