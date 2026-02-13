import { Component, computed, input, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { LayoutList, FilePlus, LogOut, ClipboardClock, LucideAngularModule, CircleUser, LogIn } from "lucide-angular";

export type SidebarMode = "ADMIN" | "MEMBER" | "PUBLIC";

interface SidebarItem {
    icon?: any,
    label: string,
    route?: string,
    exact?: boolean,
    action?: () => void;
    text?: boolean
}


@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, LucideAngularModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
    mode = input.required<SidebarMode>();

    private authService = inject(AuthService);
    private router = inject(Router);

    isLoggedIn = this.authService.isLoggedIn;


    items = computed(() => {
        if (this.isLoggedIn()) {

            return this.mode() === 'ADMIN' ? this.adminItems : this.memberItems;
        } else {
            return this.publicItems
        }
    })

    private readonly adminItems: SidebarItem[] =
        [
            {
                label: '動態問卷',
                text: true
            },
            {
                icon: LayoutList,
                label: '回列表頁',
                route: '/admin/surveys',
                exact: true

            },
            {
                icon: FilePlus,
                label: '新增問卷',
                route: '/admin/surveys/create',

            },
            {
                icon: LogOut,
                label: '登出',
                action: () => this.logout()

            },
        ];

    private readonly memberItems: SidebarItem[] =
        [
            {
                label: '動態問卷',
                text: true
            },
            {
                icon: LayoutList,
                label: '返回列表頁',
                route: '/surveys',
                exact: true
            },
            {
                icon: ClipboardClock,
                label: '填寫紀錄',
                route: '/member/responses'
            },
            {
                icon: CircleUser,
                label: '修改會員資料',
                route: '/member/profile'
            },
            {
                icon: LogOut,
                label: '登出',
                action: () => this.logout()
            },
        ];

    private readonly publicItems: SidebarItem[] = [
        {
            label: '動態問卷',
            text: true
        },
        {
            icon: LayoutList,
            label: '回列表頁',
            route: '/admin/surveys',
            exact: true
        },
        {
            icon: LogIn,
            label: '登入',
            route: '/login',
        },
    ]

    private logout(): void {
        this.authService.logout()
        this.router.navigate(['/login'])
    }
}
