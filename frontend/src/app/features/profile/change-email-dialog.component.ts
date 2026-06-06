import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rp-change-email-dialog',
  template: `
    <h2 mat-dialog-title>Change Email</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>New Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          <mat-error>Enter a valid email address</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Current Password</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="current-password" />
          <mat-hint>Required to confirm changes</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 8px 0 4px;
        min-width: 320px;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class ChangeEmailDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ChangeEmailDialogComponent>);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  save(): void {
    if (this.form.valid) this.dialogRef.close(this.form.value);
  }
}
