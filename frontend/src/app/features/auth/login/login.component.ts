import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'rp-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly bgImageUrl = environment.cdnUrl ? `${environment.cdnUrl}/images/auth-bg.jpg` : '';
  readonly loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    this.form.markAllAsTouched();

    this.loading.set(true);
    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: ({ token }) => {
        this.auth.storeToken(token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackBar.open('Login failed. Please try again.', 'Dismiss', { duration: 4000 });
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
