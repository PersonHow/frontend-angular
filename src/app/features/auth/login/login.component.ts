import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ERROR_MESSAGES, VALIDATION, ROUTES } from "../../../shared/constants/app.constants";


@Component({
    selector: "app-login",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})

export class LoginComponent {
    loginForm: FormGroup;
    isSubmitting = signal(false);
    errorMessage = signal<string>('');
    showPassword = signal(false);

    readonly ROUTES = ROUTES;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [
                Validators.required,
                Validators.minLength(VALIDATION.PASSWORD_MIN_LENGTH),
                Validators.maxLength(VALIDATION.PASSWORD_MAX_LENGTH)
            ]]
        })
    }


    // 密碼是否顯示
    togglePasswordVisibility(): void {
        this.showPassword.update(v => !v);
    }

    // 取得表單欄位錯誤訊息
    getFieldError(fieldName: string): string {
        const field = this.loginForm.get(fieldName);

        if (!field || !field.errors || !field.touched) return '';

        if (field.errors['required']) {
            return fieldName === 'email' ? "請輸入電子信箱" : "請輸入密碼";
        }

        if (field.errors["email"]) {
            return "請輸入有效的電子信箱";
        }

        if (field.errors['minlength'] || field.errors['maxlength']) {
            return `密碼必須由${VALIDATION.PASSWORD_MIN_LENGTH}到${VALIDATION.PASSWORD_MAX_LENGTH}碼`;
        }

        return '';
    }

    // 送出表單
    onSubmit(): void {
        // 將所有欄位標記成 Touched 已顯示錯誤
        this.loginForm.markAllAsTouched();

        if (this.loginForm.invalid) {
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set("");

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.isSubmitting.set(false);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this.errorMessage.set(err.message || ERROR_MESSAGES.UNKNOWN_ERROR);
            }
        });
    }
}
