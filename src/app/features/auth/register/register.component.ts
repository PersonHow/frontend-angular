import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROUTES, VALIDATION, ERROR_MESSAGES } from '../../../shared/constants/app.constants';
import { validate } from '@angular/forms/signals';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    registerForm: FormGroup;
    isSubmitting = signal(false);
    errorMessage = signal('');
    showPassword = signal(false);

    readonly ROUTES = ROUTES;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            sex: ['', [Validators.required]],
            password: ['', [
                Validators.required,
                Validators.minLength(VALIDATION.PASSWORD_MIN_LENGTH),
                Validators.maxLength(VALIDATION.PASSWORD_MAX_LENGTH)
            ]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9\-]+$/)]]
        });
    }

    getFieldError(fieldName: string): string | null {
        const field = this.registerForm.get(fieldName);
        if (field && field.invalid && field.touched) {
            if (field.errors?.['required']) {
                return ERROR_MESSAGES[`${fieldName.toUpperCase()}_REQUIRED` as keyof typeof ERROR_MESSAGES];
            }
            if (field.errors?.['email']) {
                return ERROR_MESSAGES.VALIDATION_ERROR;
            }
            if (field.errors?.['minlength'] || field.errors?.['maxlength']) {
                return ERROR_MESSAGES.VALIDATION_ERROR;
            }
        }
        return null;
    }

    togglePasswordVisibility(): void {
        this.showPassword.set(!this.showPassword());
    }

    onSubmit(): void {
        this.errorMessage.set('');

        // 標記所有欄位為 touched
        Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.markAsTouched();
        });

        if (this.registerForm.invalid) {
            return;
        }

        this.isSubmitting.set(true);

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.router.navigate([ROUTES.LOGIN]);
            },
            error: (error) => {
                this.errorMessage.set(error.message || ERROR_MESSAGES.REGISTER_FAILED);
                this.isSubmitting.set(false);
            },
            complete: () => {
                this.isSubmitting.set(false);
            }
        });
    }
}
