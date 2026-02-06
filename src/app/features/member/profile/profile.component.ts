import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

// Models
import { MemberProfileResponse, UpdateMemberProfileRequest, AccountSex } from '../../../shared/models';

// Constants
import { VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from '../../../shared/constants/app.constants';

// Components
import { SidebarComponent } from '../../../shared/components';

@Component({
    selector: 'app-member-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SidebarComponent
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private apiService = inject(ApiService);
    private authService = inject(AuthService);
    private router = inject(Router);

    // State
    isLoading = signal(false);
    isSubmitting = signal(false);
    errorMessage = signal('');
    successMessage = signal('');
    showPassword = signal(false);

    // Profile Data
    profileData = signal<MemberProfileResponse | null>(null);

    // Constants for template
    readonly LIMITS = VALIDATION;
    readonly AccountSex = AccountSex;

    // Form
    profileForm = this.fb.group({
        name: ['', [Validators.required]],
        email: [{ value: '', disabled: true }], // Email 不可修改
        phone: ['', [Validators.required, Validators.pattern(/^[0-9\-]+$/)]],
        sex: ['', [Validators.required]],
        new_password: ['', [
            Validators.minLength(VALIDATION.PASSWORD_MIN_LENGTH),
            Validators.maxLength(VALIDATION.PASSWORD_MAX_LENGTH)
        ]] // 密碼選填
    });

    ngOnInit(): void {
        this.loadProfile();
    }

    // 載入個人資料
    loadProfile(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.apiService.getMemberProfile().subscribe({
            next: (profile) => {
                this.profileData.set(profile);

                // 填充表單
                this.profileForm.patchValue({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    sex: profile.sex
                });

                this.isLoading.set(false);
            },
            error: (error) => {
                this.errorMessage.set(error.message || ERROR_MESSAGES.SERVER_ERROR);
                this.isLoading.set(false);
            }
        });
    }

    // 取得欄位錯誤訊息
    getFieldError(fieldName: string): string | null {
        const field = this.profileForm.get(fieldName);
        if (field && field.invalid && field.touched) {
            if (field.errors?.['required']) {
                return `${fieldName === 'name' ? '姓名' : fieldName === 'phone' ? '手機' : '性別'}為必填`;
            }
            if (field.errors?.['pattern']) {
                return '手機格式不正確';
            }
            if (field.errors?.['minlength'] || field.errors?.['maxlength']) {
                return `密碼須為 ${VALIDATION.PASSWORD_MIN_LENGTH} 到 ${VALIDATION.PASSWORD_MAX_LENGTH} 字元`;
            }
        }
        return null;
    }

    // 顯示/隱藏密碼
    togglePasswordVisibility(): void {
        this.showPassword.update(v => !v);
    }

    // 提交表單
    onSubmit(): void {
        // 標記所有欄位為 touched
        this.profileForm.markAllAsTouched();

        if (this.profileForm.invalid) {
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');

        const formValue = this.profileForm.getRawValue();

        // 構建請求資料（只傳送有變更的欄位）
        const request: UpdateMemberProfileRequest = {
            name: formValue.name || undefined,
            phone: formValue.phone || undefined,
            new_password: formValue.new_password || undefined
        };

        // 如果密碼為空，移除此欄位
        if (!request.new_password) {
            delete request.new_password;
        }

        this.apiService.updateMemberProfile(request).subscribe({
            next: (response) => {
                this.profileData.set(response);
                this.successMessage.set(SUCCESS_MESSAGES.PROFILE_UPDATED);

                // 更新 AuthService 中的用戶資料
                const currentUser = this.authService.currentUser();
                if (currentUser) {
                    // 這裡可能需要更新 localStorage 中的用戶資料
                    // 如果 AuthService 有提供更新方法，應該調用它
                }

                // 清空密碼欄位
                this.profileForm.patchValue({ new_password: '' });

                this.isSubmitting.set(false);

                // 3 秒後清除成功訊息
                setTimeout(() => {
                    this.successMessage.set('');
                }, 3000);
            },
            error: (error) => {
                this.errorMessage.set(error.message || ERROR_MESSAGES.SERVER_ERROR);
                this.isSubmitting.set(false);
            }
        });
    }

    // 取消編輯
    onCancel(): void {
        // 重新載入原始資料
        if (this.profileData()) {
            const profile = this.profileData()!;
            this.profileForm.patchValue({
                name: profile.name,
                phone: profile.phone,
                sex: profile.sex,
                new_password: ''
            });
        }
    }
}
