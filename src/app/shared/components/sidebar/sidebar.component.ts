import { Component, computed, input, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

export type SidebarMode = "admin" | "member";

interface SidebarItem {
    icon: string,
    label: string,
    route?: string,
    action?: () => void;
}


@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
    mode = input.required<SidebarMode>();

    private authService = inject(AuthService);
    private router = inject(Router);

    items = computed(() => {
        return this.mode() === 'admin' ? this.adminItems : this.memberItems;
    })

    private readonly adminItems: SidebarItem[] =
        [
            {
                icon: 'view_list',
                label: '回列表頁',
                route: '/admin/surveys',

            },
            {
                icon: 'add',
                label: '新增問卷',
                route: '/admin/surveys/create',

            },
            {
                icon: 'logout',
                label: '登出',
                action: () => this.logout()

            },
        ];

    private readonly memberItems: SidebarItem[] =
        [
            {
                icon: 'view_list',
                label: '返回列表頁',
                route: '/surveys'
            },
            {
                icon: 'history',
                label: '填寫紀錄',
                route: '/member/responses'
            },
            {
                icon: 'account_circle',
                label: '修改會員資料',
                route: '/member/profile'
            },
            {
                icon: 'logout',
                label: '登出',
                action: () => this.logout()
            },
        ];

    private logout(): void {
        this.authService.logout()
        this.router.navigate(['/login'])
    }
}
