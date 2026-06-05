import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rp-delete-account-dialog',
  template: `
    <h2 mat-dialog-title>Delete Account</h2>
    <mat-dialog-content>
      <p class="warning-text">
        This action is <strong>permanent and cannot be undone.</strong> All your sessions,
        routes, and analytics data will be deleted.
      </p>
      <mat-form-field appearance="outline" class="confirm-field">
        <mat-label>Type DELETE to confirm</mat-label>
        <input matInput [(ngModel)]="confirmText" autocomplete="off" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        class="delete-btn"
        [disabled]="confirmText !== 'DELETE'"
        (click)="dialogRef.close(true)"
      >
        Delete Account
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .warning-text {
        color: rgba(240, 236, 228, 0.7);
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .confirm-field {
        width: 100%;
        min-width: 320px;
      }
      .delete-btn {
        background-color: #c0392b !important;
        color: #fff !important;
      }
      .delete-btn[disabled] {
        opacity: 0.4 !important;
      }
    `,
  ],
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class DeleteAccountDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteAccountDialogComponent>);
  confirmText = '';
}
