import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth.guard';
import { adminGuard, memberGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'surveys',
        pathMatch: 'full'
    },
    // === 認證頁面 ===
    {
        path: "login",
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: "register",
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
    },

    // === 公開問卷頁面 ===
    {
        path: "surveys",
        loadComponent: () => import('./features/public/survey-list/survey-list.component').then(m => m.SurveyListComponent),
    },
    {
        path: "surveys/:id/fill",
        loadComponent: () => import('./features/public/survey-fill/survey-fill.component').then(m => m.SurveyFillComponent),
    },

    // === 管理員後台 ===
    {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'surveys', pathMatch: 'full' },
            {
                path: 'surveys',
                loadComponent: () => import('./features/admin/survey-list/admin-survey-list.component').then(m => m.AdminSurveyListComponent)
            },
            {
                path: 'surveys/create',
                loadComponent: () => import('./features/admin/survey-create/survey-create.component').then(m => m.SurveyCreateComponent)
            },
            {
                // 修正：統一使用 /edit 結尾代表編輯
                path: 'surveys/:id/edit',
                loadComponent: () => import('./features/admin/survey-edit/survey-edit.component').then(m => m.SurveyEditComponent)
            },
            {
                path: 'surveys/:id/results',
                loadComponent: () => import('./features/admin/survey-results/survey-results.component').then(m => m.SurveyResultsComponent)
            },
            {
                path: 'surveys/:id/statistics',
                loadComponent: () => import('./features/admin/survey-statistics/survey-statistics.component').then(m => m.SurveyStatisticsComponent)
            },
            {
                path: 'responses/:id',
                loadComponent: () => import('./features/admin/response-detail/response-detail.component').then(m => m.ResponseDetailComponent)
            }
        ]
    },

    // === 會員專區 ===
    {
        path: 'member',
        canActivate: [memberGuard],
        children: [
            { path: '', redirectTo: 'responses', pathMatch: 'full' },
            {
                path: 'responses',
                loadComponent: () => import('./features/member/response-history/response-history.component').then(m => m.ResponseHistoryComponent)
            },
            {
                // 修正：查看詳情應該指向詳情組件，而非列表組件
                path: 'responses/:id',
                loadComponent: () => import('./features/member/response-detail/response-detail.component').then(m => m.ResponseDetailComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/member/profile/profile.component').then(m => m.ProfileComponent)
            }
        ]
    },

    // === 404 頁面 ===
    {
        path: '**',
        loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
