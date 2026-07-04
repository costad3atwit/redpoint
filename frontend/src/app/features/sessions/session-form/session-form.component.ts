import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionService } from '../../../core/services/session.service';
import { RouteService } from '../../../core/services/route.service';
import { Route, RouteAttempt, CreateAttemptPayload, CreateRoutePayload } from '../../../models/session.model';
import { GradeOption, V_GRADES, YDS_GRADES } from '../../../core/utils/grade-utils';
const WALL_STYLES: { label: string; value: string }[] = [
  { label: 'Overhang', value: 'overhang' },
  { label: 'Vertical',  value: 'vertical' },
  { label: 'Slab',      value: 'slab' },
];
const SEND_TYPES: { label: string; value: string }[] = [
  { label: 'Send',     value: 'send' },
  { label: 'Flash',    value: 'flash' },
  { label: 'Onsight',  value: 'onsight' },
  { label: 'Redpoint', value: 'redpoint' },
];
const HOLD_TYPES: { label: string; value: string }[] = [
  { label: 'Crimp',    value: 'crimp' },
  { label: 'Pinch',    value: 'pinch' },
  { label: 'Sloper',   value: 'sloper' },
  { label: 'Pocket',   value: 'pocket' },
  { label: 'Jug',      value: 'jug' },
  { label: 'Sidepull', value: 'sidepull' },
];
const CLIMBING_STYLES: { label: string; value: string }[] = [
  { label: 'Bouldering',       value: 'bouldering' },
  { label: 'Sport Climbing',   value: 'sport climbing' },
  { label: 'Top Rope',         value: 'top rope' },
  { label: 'Traditional',      value: 'traditional climbing' },
];
const ENVIRONMENTS: { label: string; value: string }[] = [
  { label: 'Gym',     value: 'gym' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Other',   value: 'other' },
];

@Component({
  selector: 'rp-session-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="form-page">
      <header class="form-header">
        <button mat-icon-button type="button" (click)="cancel()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ editId() ? 'Edit Session' : 'Log Session' }}</h2>
      </header>

      @if (loadingEdit()) {
        <div class="spinner-wrap"><mat-spinner diameter="40" /></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Session Info -->
          <mat-card class="section-card">
            <mat-card-content>
              <p class="section-label">Session Info</p>
              <div class="fields-row">
                <mat-form-field appearance="fill">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="date" />
                  <mat-datepicker-toggle matIconSuffix [for]="picker" />
                  <mat-datepicker #picker />
                </mat-form-field>
                <mat-form-field appearance="fill">
                  <mat-label>Duration (min)</mat-label>
                  <input matInput type="number" formControlName="duration_minutes" min="1" />
                </mat-form-field>
              </div>
              <div class="slider-field">
                <span class="slider-label">RPE: <strong>{{ form.value.rpe }}</strong>/10</span>
                <mat-slider min="1" max="10" step="1" class="full-slider">
                  <input matSliderThumb formControlName="rpe" />
                </mat-slider>
              </div>
              <div class="slider-field">
                <span class="slider-label">Finger Load: <strong>{{ form.value.finger_load_rating }}</strong>/10</span>
                <mat-slider min="1" max="10" step="1" class="full-slider">
                  <input matSliderThumb formControlName="finger_load_rating" />
                </mat-slider>
              </div>
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" placeholder="How did it feel?"></textarea>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Routes -->
          <div class="routes-section">
            <div class="routes-header">
              <h3>Routes</h3>
              <div class="add-buttons">
                <button mat-stroked-button type="button" (click)="addNewRoute()">
                  <mat-icon>add</mat-icon> New Route
                </button>
                <button mat-stroked-button type="button" (click)="addFromLibrary()">
                  <mat-icon>library_books</mat-icon> From Library
                </button>
              </div>
            </div>

            <ng-container formArrayName="routes">
              @for (route of routesArray.controls; track route) {
                <mat-card class="route-card" [formGroupName]="$index">
                  <mat-card-content>
                    <div class="route-card-header">
                      <span class="route-index">Route {{ $index + 1 }}</span>
                      <button mat-icon-button type="button" (click)="removeRoute($index)" [disabled]="routesArray.length === 1">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>

                    <!-- Library picker mode -->
                    @if (route.get('mode')?.value === 'existing') {
                      @if (!getSelectedRoute(route)) {
                        <!-- Route picker -->
                        <mat-form-field appearance="fill" class="full-width">
                          <mat-label>Search routes</mat-label>
                          <input matInput [value]="routeSearch()" (input)="routeSearch.set($any($event.target).value)" placeholder="Name or grade…" />
                          <mat-icon matIconSuffix>search</mat-icon>
                        </mat-form-field>
                        <div class="route-picker-list">
                          @if (routeLibrary().length === 0) {
                            <p class="picker-empty">No routes in your library yet.</p>
                          }
                          @for (r of filteredRoutes(); track r.id) {
                            <div class="picker-item" (click)="selectRoute(route, r)">
                              <span class="picker-grade">{{ r.grade }}</span>
                              <div class="picker-meta">
                                <span class="picker-name">{{ r.name ?? 'Unnamed route' }}</span>
                                <span class="picker-tags">
                                  @if (r.style) { <span class="picker-tag">{{ formatStyle(r.style) }}</span> }
                                  @if (r.wallStyle) { <span class="picker-tag">{{ formatWallStyle(r.wallStyle) }}</span> }
                                </span>
                              </div>
                            </div>
                          }
                        </div>
                      } @else {
                        <!-- Selected route summary -->
                        <div class="selected-route">
                          <div class="selected-route-info">
                            <span class="route-grade-badge">{{ getSelectedRoute(route)!.grade }}</span>
                            <div>
                              <p class="selected-name">{{ getSelectedRoute(route)!.name ?? 'Unnamed route' }}</p>
                              <p class="selected-angle">
                                @if (getSelectedRoute(route)!.style) {
                                  {{ formatStyle(getSelectedRoute(route)!.style!) }}
                                }
                                @if (getSelectedRoute(route)!.style && getSelectedRoute(route)!.wallStyle) { · }
                                @if (getSelectedRoute(route)!.wallStyle) {
                                  {{ formatWallStyle(getSelectedRoute(route)!.wallStyle!) }}
                                }
                              </p>
                            </div>
                          </div>
                          <button mat-button type="button" (click)="clearSelectedRoute(route)">Change</button>
                        </div>
                      }
                    } @else {
                      <!-- New route fields -->
                      <div class="fields-row">
                        <mat-form-field appearance="fill">
                          <mat-label>Climbing Style</mat-label>
                          <mat-select formControlName="style" (selectionChange)="onStyleChange(route)">
                            @for (s of climbingStyles; track s.value) {
                              <mat-option [value]="s.value">{{ s.label }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="fill">
                          <mat-label>Environment</mat-label>
                          <mat-select formControlName="environment">
                            @for (e of environments; track e.value) {
                              <mat-option [value]="e.value">{{ e.label }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                      </div>
                      <div class="fields-row">
                        <mat-form-field appearance="fill">
                          <mat-label>Grade</mat-label>
                          <mat-select formControlName="grade">
                            @for (g of gradesForRoute(route); track g.value) {
                              <mat-option [value]="g.value">{{ g.label }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="fill">
                          <mat-label>Wall Style</mat-label>
                          <mat-select formControlName="wall_style">
                            @for (w of wallStyles; track w.value) {
                              <mat-option [value]="w.value">{{ w.label }}</mat-option>
                            }
                          </mat-select>
                        </mat-form-field>
                      </div>
                      <mat-form-field appearance="fill" class="full-width">
                        <mat-label>Route Name (optional)</mat-label>
                        <input matInput formControlName="name" placeholder="e.g. The Crimpy One" />
                      </mat-form-field>

                      <div class="hold-type-section">
                        <span class="section-label hold-type-label">Hold Types</span>
                        <div class="pill-row">
                          @for (h of holdTypes; track h.value) {
                            <button
                              type="button"
                              class="pill"
                              [class.pill--selected]="isHoldTypeSelected(route, h.value)"
                              (click)="toggleHoldType(route, h.value)"
                            >{{ h.label }}</button>
                          }
                        </div>
                      </div>
                    }

                    <!-- Attempt fields — always shown once a route is selected or in new-route mode -->
                    @if (route.get('mode')?.value === 'new' || getSelectedRoute(route)) {
                      <mat-divider class="attempt-divider" />
                      <div class="fields-row">
                        <mat-form-field appearance="fill">
                          <mat-label>Route Length (moves)</mat-label>
                          <input matInput type="number" formControlName="route_length" min="1" />
                        </mat-form-field>
                        <mat-form-field appearance="fill">
                          <mat-label>Attempts</mat-label>
                          <input matInput type="number" formControlName="attempts" min="1" />
                        </mat-form-field>
                      </div>
                      <div class="sent-row">
                        <mat-slide-toggle formControlName="sent">Sent</mat-slide-toggle>
                        @if (route.get('sent')?.value) {
                          <mat-form-field appearance="fill" class="send-type-field">
                            <mat-label>Send Type</mat-label>
                            <mat-select formControlName="send_type">
                              @for (st of sendTypes; track st.value) {
                                <mat-option
                                  [value]="st.value"
                                  [disabled]="st.value === 'flash' && route.get('attempts')?.value !== 1"
                                >{{ st.label }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>
                        }
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </ng-container>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-flat-button type="submit" [disabled]="!canSubmit()">
              @if (submitting()) {
                <mat-spinner diameter="20" />
              } @else {
                {{ editId() ? 'Save Changes' : 'Save Session' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .form-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 48px; }
    .section-card { margin-bottom: 16px; }
    .section-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rp-text-muted); margin: 0 0 20px; }
    .fields-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .fields-row mat-form-field { flex: 1; min-width: 140px; }
    .full-width { width: 100%; }
    .slider-field { margin-bottom: 16px; }
    .slider-label { display: block; font-size: 0.85rem; color: var(--rp-text-muted); margin-bottom: 4px; }
    .full-slider { width: 100%; }

    .routes-section { margin-top: 8px; }
    .routes-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .routes-header h3 { margin: 0; }
    .add-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

    .route-card { margin-bottom: 12px; }
    .route-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .route-index { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--rp-text-muted); }

    /* Library picker */
    .route-picker-list {
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--rp-border);
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .picker-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      cursor: pointer;
      border-bottom: 1px solid var(--rp-border);
      transition: background 0.12s;
    }
    .picker-item:last-child { border-bottom: none; }
    .picker-item:hover { background: var(--rp-surface-elevated); }
    .picker-grade {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: uppercase;
      min-width: 36px;
    }
    .picker-meta { display: flex; flex-direction: column; }
    .picker-name { font-size: 0.9rem; }
    .picker-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
    .picker-tag { font-size: 0.72rem; color: var(--rp-text-muted); }
    .picker-empty { padding: 16px; text-align: center; color: var(--rp-text-muted); font-size: 0.85rem; margin: 0; }

    /* Selected route */
    .selected-route {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      margin-bottom: 4px;
    }
    .selected-route-info { display: flex; align-items: center; gap: 12px; }
    .route-grade-badge {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      text-transform: uppercase;
      background: var(--rp-surface-elevated);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .selected-name { margin: 0; font-size: 0.9rem; }
    .selected-angle { margin: 2px 0 0; font-size: 0.75rem; color: var(--rp-text-muted); }

    .hold-type-section { width: 100%; margin-top: 12px; }
    .hold-type-label { display: block; margin-bottom: 8px; }
    .pill-row { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; }
    .pill {
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--rp-border);
      background: var(--rp-surface-elevated);
      color: var(--rp-text-muted);
      font-size: 0.8rem;
      cursor: pointer;
      transition: background 0.12s, color 0.12s, border-color 0.12s;
    }
    .pill:hover { border-color: var(--rp-accent); }
    .pill--selected {
      background: var(--rp-accent);
      border-color: var(--rp-accent);
      color: #fff;
    }

    .attempt-divider { margin: 12px 0; }
    .sent-row { display: flex; align-items: center; gap: 24px; margin-top: 8px; flex-wrap: wrap; }
    .send-type-field { flex: 1; min-width: 160px; }

    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-bottom: 40px; }
  `],
})
export class SessionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private routeService = inject(RouteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);

  readonly vGrades: GradeOption[] = V_GRADES;
  readonly ydsGrades: GradeOption[] = YDS_GRADES;
  readonly wallStyles = WALL_STYLES;
  readonly sendTypes = SEND_TYPES;
  readonly holdTypes = HOLD_TYPES;
  readonly climbingStyles = CLIMBING_STYLES;
  readonly environments = ENVIRONMENTS;

  readonly editId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly loadingEdit = signal(false);
  readonly routeLibrary = signal<Route[]>([]);
  readonly routeSearch = signal('');
  readonly filteredRoutes = computed(() => {
    const q = this.routeSearch().toLowerCase();
    if (!q) return this.routeLibrary();
    return this.routeLibrary().filter(r =>
      (r.name ?? '').toLowerCase().includes(q) || r.grade.toLowerCase().includes(q)
    );
  });

  private existingAttempts: RouteAttempt[] = [];
  private selectedRouteByControl = new Map<AbstractControl, Route>();
  private openPickers = new Set<AbstractControl>();

  readonly form = this.fb.group({
    date: [new Date(), Validators.required],
    duration_minutes: [null as number | null, [Validators.required, Validators.min(1)]],
    rpe: [5, Validators.required],
    finger_load_rating: [5, Validators.required],
    notes: [''],
    routes: this.fb.array([this.buildRoute('new')]),
  });

  get routesArray(): FormArray {
    return this.form.get('routes') as FormArray;
  }

  canSubmit(): boolean {
    if (this.form.invalid || this.submitting()) return false;
    return this.routesArray.controls.every(ctrl => {
      if (ctrl.get('mode')?.value === 'existing') {
        return this.selectedRouteByControl.has(ctrl);
      }
      return true;
    });
  }

  ngOnInit(): void {
    this.routeService.getRoutes().subscribe(routes => this.routeLibrary.set(routes));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editId.set(id);
    this.loadingEdit.set(true);

    this.sessionService.getSession(id).subscribe({
      next: session => {
        this.existingAttempts = session.routeAttempts;
        this.form.patchValue({
          date: new Date(session.date),
          duration_minutes: session.durationMinutes,
          rpe: session.rpe,
          finger_load_rating: session.fingerLoadRating,
          notes: session.notes ?? '',
        });

        this.routesArray.clear();
        const toLoad = session.routeAttempts.length ? session.routeAttempts : [null];
        toLoad.forEach(a => {
          if (!a) {
            this.routesArray.push(this.buildRoute('new'));
            return;
          }
          const group = this.buildRoute('existing', {
            route_id: a.routeId,
            sent: a.sent,
            send_type: a.sendType ?? null,
            route_length: a.routeLength ?? null,
            attempts: a.attempts ?? 1,
            notes: a.notes ?? '',
          });
          this.routesArray.push(group);
          this.selectedRouteByControl.set(group, a.route);
        });

        this.loadingEdit.set(false);
      },
      error: () => {
        this.loadingEdit.set(false);
        this.snackBar.open('Failed to load session', 'Dismiss', { duration: 4000 });
        this.router.navigate(['/sessions']);
      },
    });
  }

  buildRoute(
    mode: 'new' | 'existing',
    values?: {
      route_id?: string;
      sent?: boolean;
      send_type?: string | null;
      route_length?: number | null;
      attempts?: number;
      notes?: string;
      // new-route fields
      grade?: string;
      wall_style?: string;
      name?: string;
      style?: string;
      environment?: string;
      hold_type?: string[];
    }
  ): FormGroup {
    const group = this.fb.group({
      mode: [mode],
      // new-route fields
      style: [values?.style ?? 'bouldering'],
      environment: [values?.environment ?? 'gym'],
      grade: [values?.grade ?? 'V0'],
      wall_style: [values?.wall_style ?? 'vertical'],
      name: [values?.name ?? ''],
      hold_type: [values?.hold_type ?? []],
      // existing-route field
      route_id: [values?.route_id ?? null],
      // attempt fields
      sent: [values?.sent ?? false],
      send_type: [values?.send_type ?? null],
      route_length: [values?.route_length ?? null],
      attempts: [values?.attempts ?? 1, Validators.min(1)],
      notes: [values?.notes ?? ''],
    });

    group.get('attempts')!.valueChanges.subscribe(value => {
      if (value !== 1 && group.get('send_type')?.value === 'flash') {
        group.get('send_type')!.setValue(null);
      }
    });

    return group;
  }

  isHoldTypeSelected(route: AbstractControl, value: string): boolean {
    const selected: string[] = route.get('hold_type')?.value ?? [];
    return selected.includes(value);
  }

  toggleHoldType(route: AbstractControl, value: string): void {
    const control = route.get('hold_type')!;
    const selected: string[] = control.value ?? [];
    control.setValue(
      selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]
    );
  }

  addNewRoute(): void {
    this.routesArray.insert(0, this.buildRoute('new'));
  }

  addFromLibrary(): void {
    this.routesArray.insert(0, this.buildRoute('existing'));
  }

  removeRoute(index: number): void {
    const ctrl = this.routesArray.at(index);
    this.selectedRouteByControl.delete(ctrl);
    this.openPickers.delete(ctrl);
    this.routesArray.removeAt(index);
  }

  getSelectedRoute(control: AbstractControl): Route | null {
    return this.selectedRouteByControl.get(control) ?? null;
  }

  selectRoute(control: AbstractControl, route: Route): void {
    control.patchValue({
      route_id: route.id,
      route_length: route.lastRouteLength ?? null,
    });
    this.selectedRouteByControl.set(control, route);
    this.routeSearch.set('');
  }

  gradesForRoute(control: AbstractControl): GradeOption[] {
    return control.get('style')?.value === 'bouldering' ? this.vGrades : this.ydsGrades;
  }

  onStyleChange(control: AbstractControl): void {
    const isBouldering = control.get('style')?.value === 'bouldering';
    const currentGrade: string = control.get('grade')?.value ?? '';
    const isVGrade = currentGrade.toUpperCase().startsWith('V');
    if (isBouldering && !isVGrade) {
      control.patchValue({ grade: 'V0' });
    } else if (!isBouldering && isVGrade) {
      control.patchValue({ grade: '5.6' });
    }
  }

  formatStyle(style: string): string {
    const found = CLIMBING_STYLES.find(s => s.value === style);
    return found ? found.label : style;
  }

  formatWallStyle(wallStyle: string): string {
    const found = WALL_STYLES.find(w => w.value === wallStyle);
    return found ? found.label : wallStyle;
  }

  clearSelectedRoute(control: AbstractControl): void {
    control.patchValue({ route_id: null });
    this.selectedRouteByControl.delete(control);
  }

  cancel(): void {
    this.location.back();
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.submitting.set(true);

    const v = this.form.getRawValue();
    const date = v.date instanceof Date ? v.date.toISOString().split('T')[0] : undefined;
    const sessionPayload = {
      date,
      duration_minutes: v.duration_minutes!,
      rpe: v.rpe!,
      finger_load_rating: v.finger_load_rating!,
      notes: v.notes || undefined,
    };

    const id = this.editId();
    const sessionOp = id
      ? this.sessionService.updateSession(id, sessionPayload)
      : this.sessionService.createSession(sessionPayload);

    sessionOp
      .pipe(
        switchMap(session => {
          const deleteOps = this.existingAttempts.length
            ? forkJoin(this.existingAttempts.map(a => this.sessionService.deleteAttempt(a.id)))
            : of([]);

          return deleteOps.pipe(
            switchMap(() => {
              const createOps = this.routesArray.controls.map(ctrl => {
                const r = ctrl.getRawValue();
                if (r.mode === 'existing') {
                  const payload: CreateAttemptPayload = {
                    route_id: r.route_id,
                    sent: r.sent,
                    send_type: r.sent ? r.send_type || undefined : undefined,
                    attempts: r.attempts || undefined,
                    route_length: r.route_length || undefined,
                    notes: r.notes || undefined,
                  };
                  return this.sessionService.createAttempt(session.id, payload);
                } else {
                  const routePayload: CreateRoutePayload = {
                    grade: r.grade,
                    wall_style: r.wall_style || undefined,
                    name: r.name || undefined,
                    style: r.style || undefined,
                    environment: r.environment || undefined,
                    hold_type: r.hold_type?.length ? r.hold_type : undefined,
                  };
                  return this.routeService.createRoute(routePayload).pipe(
                    switchMap(route => {
                      const payload: CreateAttemptPayload = {
                        route_id: route.id,
                        sent: r.sent,
                        send_type: r.sent ? r.send_type || undefined : undefined,
                        attempts: r.attempts || undefined,
                        route_length: r.route_length || undefined,
                        notes: r.notes || undefined,
                      };
                      return this.sessionService.createAttempt(session.id, payload);
                    })
                  );
                }
              });
              return createOps.length ? forkJoin(createOps) : of([]);
            })
          );
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open(id ? 'Session updated!' : 'Session saved!', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/sessions']);
        },
        error: () => {
          this.submitting.set(false);
          this.snackBar.open('Failed to save session', 'Dismiss', { duration: 4000 });
        },
      });
  }
}
