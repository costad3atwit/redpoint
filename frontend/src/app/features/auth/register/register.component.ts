import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { extractErrorMessage } from '../../../core/utils/http-error';

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  'Email already registered': 'An account with this email already exists. Try logging in instead.',
  'Username already taken': 'That username is already taken. Please choose another.',
};

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'rp-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly bgImageUrl = environment.cdnUrl ? `${environment.cdnUrl}/images/auth-bg.jpg` : '';
  readonly loading = signal(false);

  form = this.fb.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    this.form.markAllAsTouched();

    this.loading.set(true);
    const { username, email, password } = this.form.value;

    this.auth.register(username!, email!, password!).subscribe({
      next: ({ token }) => {
        this.auth.storeToken(token);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        const message = extractErrorMessage(
          err,
          'Registration failed. Please try again.',
          REGISTER_ERROR_MESSAGES
        );
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
