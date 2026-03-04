import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, User, Mail, Phone, Calendar, FileText } from 'lucide-angular';

// Shared Components
import { SidebarComponent } from '../../../shared/components';

// Services & Models
import { UserService } from '../../../core/services/user.service';
import { AdminAccountDetailDTO, Role, AccountSex, SURVEY_STATUS_CONFIG } from '../../../shared/models';

@Component({
    selector: 'app-admin-account-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LucideAngularModule,
        SidebarComponent
    ],
    templateUrl: './admin-account-detail.component.html',
    styleUrls: ['./admin-account-detail.component.scss']
})
export class AdminAccountDetailComponent implements OnInit {
    private userService = inject(UserService);
    private route = inject(ActivatedRoute);
    private location = inject(Location);

    // Icons
    readonly icons = { ArrowLeft, User, Mail, Phone, Calendar, FileText };
    readonly Role = Role;
    readonly AccountSex = AccountSex;
    readonly statusConfig = SURVEY_STATUS_CONFIG;

    account = signal<AdminAccountDetailDTO | null>(null);
    isLoading = signal<boolean>(true);

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.loadDetail(Number(idParam));
        }
    }

    loadDetail(id: number) {
        this.isLoading.set(true);
        this.userService.adminGetAccountDetail(id).subscribe({
            next: (data) => {
                this.account.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('獲取會員詳情失敗', err);
                this.isLoading.set(false);
            }
        });
    }

    goBack() {
        this.location.back();
    }
}
