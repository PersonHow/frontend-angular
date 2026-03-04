import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { LucideAngularModule, Users, Eye } from "lucide-angular";


import { SidebarComponent, PaginationComponent, SearchBarComponent } from "../../../shared/components";

import { UserService } from "../../../core/services/user.service";
import { AdminAccountListDTO, Role, SearchField, SearchParams } from "../../../shared/models";

@Component({
    selector: 'app-account-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideAngularModule,
        SidebarComponent,
        PaginationComponent,
        SearchBarComponent,
    ],
    templateUrl: "./admin-account-list.component.html",
    styleUrl: "./admin-account-list.component.scss"
})


export class AdminAccountListComponent {
    private userService = inject(UserService)

    readonly icons = { Users, Eye };
    readonly Role = Role;

    accounts = signal<AdminAccountListDTO[]>([]);
    isLoading = signal<boolean>(false);
    keyword = signal<string>('');

    // 分頁狀態
    currentPage = signal(1);
    totalPages = signal(0);
    totalElements = signal(0);
    pageSize = signal(10);

    // 搜尋欄位定義
    searchFields: SearchField[] = [
        { name: 'keyword', label: '會員名稱', type: 'text', placeholder: '請輸入會員姓名或信箱搜尋...'}
    ];

    ngOnInit() {
        this.loadData(1);
    }

    loadData(page: number) {
        this.isLoading.set(true);
        const apiPage = page - 1;

        this.userService.adminGetAllAccounts(this.keyword(), apiPage, this.pageSize()).subscribe({
            next: (res) => {
                this.accounts.set(res.content);
                this.currentPage.set(res.page + 1);
                this.totalPages.set(res.total_pages);
                this.totalElements.set(res.total_elements);
                this.isLoading.set(false);
                console.log(this.keyword());
                console.log(res);
                
            },
            error: (err) => {
                console.error('獲取會員列表失敗', err);
                this.isLoading.set(false);
            }
        })
    }

    onSearch(params: SearchParams) {
        const searchKeyword = params['keyword'] || '';
        this.keyword.set(searchKeyword);
        this.loadData(1);
    }

    onReset(){
        this.keyword.set('');
        this.loadData(1);
    }

    onPageChange(page: number) {
        this.loadData(page);
    }
}
