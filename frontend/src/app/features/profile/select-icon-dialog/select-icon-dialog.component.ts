import { Component, inject, signal } from '@angular/core';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PROFILE_ICONS, isCustomIcon } from '../profile-icons';

export interface SelectIconDialogData {
  currentIcon: string | null;
}

export interface SelectIconDialogResult {
  icon: string | null;
}

@Component({
  selector: 'rp-select-icon-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './select-icon-dialog.component.html',
  styleUrl: './select-icon-dialog.component.scss',
})
export class SelectIconDialogComponent {
  private dialogRef = inject(MatDialogRef<SelectIconDialogComponent>);
  private data = inject<SelectIconDialogData>(MAT_DIALOG_DATA);

  readonly icons = PROFILE_ICONS;
  readonly isCustomIcon = isCustomIcon;
  readonly selected = signal<string | null>(this.data.currentIcon);

  select(icon: string): void {
    this.selected.set(icon);
  }

  save(): void {
    this.dialogRef.close({ icon: this.selected() } satisfies SelectIconDialogResult);
  }

  clear(): void {
    this.dialogRef.close({ icon: null } satisfies SelectIconDialogResult);
  }
}
