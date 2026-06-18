import { Component, computed, input, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { SessionTimerComponent } from "../session-timer/session-timer.component";
import { TableProperties, FilePlus, LogOut, FolderOpenDot, Users,
    ClipboardClock, LucideAngularModule, CircleUser, LogIn } from "lucide-angular";

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
    imports: [RouterLink, RouterLinkActive, LucideAngularModule, SessionTimerComponent],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
    mode = input.required<SidebarMode>();

    private authService = inject(AuthService);
    private router = inject(Router);

    private listIcon = TableProperties;

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
                icon: this.listIcon,
                label: '問卷列表頁',
                route: '/admin/surveys',
                exact: true
            },
            {
                icon: Users,
                label: '會員管理頁',
                route: '/admin/accounts',
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
                icon: this.listIcon,
                label: '返回列表頁',
                route: '/surveys',
                exact: true
            },
            {
                icon: FolderOpenDot,
                label:'屬於我的問卷',
                route:'/member/surveys',
                exact: true
            },
            {
                icon:FilePlus,
                label:'新增問卷',
                route:'/member/surveys/create',
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
            icon: this.listIcon,
            label: '回列表頁',
            route: '/surveys',
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
