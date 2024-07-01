import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  GetDashboardTimeV1Project,
  GetDashboardTimeV1ProjectActivity,
  GetDashboardTimeV1TimeForDateTimes,
} from '../../models/staff-dashboard/get-dashboard-time-v1';
import { StaffDashboardService } from '../service/staff-dashboard.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  pairwise,
  shareReplay,
  startWith,
  takeUntil,
} from 'rxjs';
import { roundToNextQuarter } from '../../common/functions/round-to-next-quarter';
import { chargeCodeToColor } from '../../common/functions/charge-code-to-color';
import { TimeStatus } from '../../models/common/time-status';

export interface HQTimeChangeEvent {
  id?: string | null;
  date?: string | null;
  hours?: number | null;
  notes?: string | null;
  task?: string | null;
  chargeCode?: string | null;
  chargeCodeId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  activityId?: string | null;
}

export interface HQTimeDeleteEvent {
  id: string;
}

interface Form {
  id: FormControl<string | null>;
  date: FormControl<string | null>;
  hours: FormControl<number | null>;
  notes: FormControl<string | null>;
  task: FormControl<string | null>;
  chargeCode: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  clientId: FormControl<string | null>;
  projectId: FormControl<string | null>;
  activityId: FormControl<string | null>;
}

@Component({
  selector: 'tr[hq-staff-dashboard-time-entry]',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-dashboard-time-entry.component.html',
})
export class StaffDashboardTimeEntryComponent implements OnChanges, OnDestroy {
  @Input()
  time?: Partial<GetDashboardTimeV1TimeForDateTimes>;

  @Output()
  hqTimeChange = new EventEmitter<HQTimeChangeEvent>();

  @Output()
  hqTimeDelete = new EventEmitter<HQTimeDeleteEvent>();

  @HostBinding('class')
  class = 'even:bg-gray-850 odd:bg-black-alt';

  private destroyed$ = new Subject<void>();

  chargeCodeToColor = chargeCodeToColor;

  form = new FormGroup<Form>({
    id: new FormControl<string | null>(null),
    date: new FormControl<string | null>(null),
    hours: new FormControl<number | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.min(0.25)],
    }),
    notes: new FormControl<string | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    task: new FormControl<string | null>(null, { updateOn: 'blur' }),
    chargeCode: new FormControl<string | null>(null),
    chargeCodeId: new FormControl<string | null>(null, [Validators.required]),
    clientId: new FormControl<string | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    projectId: new FormControl<string | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    activityId: new FormControl<string | null>(null),
  });

  projects$: Observable<GetDashboardTimeV1Project[]>;
  activities$: Observable<GetDashboardTimeV1ProjectActivity[]>;

  timeStatus = TimeStatus;

  constructor(public staffDashboardService: StaffDashboardService) {
    const form$ = this.form.valueChanges.pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const clientId$ = form$.pipe(
      map((t) => t.clientId),
      distinctUntilChanged(),
    );

    const projectId$ = form$.pipe(
      map((t) => t.projectId),
      distinctUntilChanged(),
    );

    const hours$ = form$.pipe(
      map((t) => t.hours),
      distinctUntilChanged(),
    );

    const client$ = combineLatest({
      clientId: clientId$,
      clients: staffDashboardService.clients$,
    }).pipe(map((t) => t.clients.find((x) => x.id == t.clientId)));

    this.projects$ = client$.pipe(map((t) => t?.projects ?? []));

    const project$ = combineLatest({
      projectId: projectId$,
      client: client$,
    }).pipe(map((t) => t.client?.projects?.find((x) => x.id == t.projectId)));

    this.activities$ = project$.pipe(
      map((t) => t?.activities ?? []),
      startWith([]),
    );

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    clientId$.pipe(pairwise(), takeUntil(this.destroyed$)).subscribe({
      next: ([previousClientId, currentClientId]) => {
        if (currentClientId != previousClientId) {
          this.form.patchValue({
            chargeCodeId: null,
            chargeCode: null,
            projectId: null,
          });
        }
      },
      error: console.error,
    });

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    project$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (project) => {
        if (project) {
          this.form.patchValue({
            chargeCodeId: project.chargeCodeId,
            chargeCode: project.chargeCode,
          });
        }
      },
      error: console.error,
    });

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    hours$.pipe(debounceTime(500), takeUntil(this.destroyed$)).subscribe({
      next: (hours) => {
        if (hours != null) {
          this.form.patchValue({ hours: roundToNextQuarter(hours) });
        }
      },
      error: console.error,
    });

    form$
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
        debounceTime(750),
        takeUntil(this.destroyed$),
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (time) => {
          if (this.form.touched && this.form.valid) {
            this.hqTimeChange.emit(time);
          }
        },
        error: console.error,
      });

    this.staffDashboardService.refresh$
      .pipe(takeUntil(this.destroyed$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: () => {
          if (!this.time?.id) {
            this.form.reset();
            this.form.patchValue({
              date: this.time?.date,
            });
          }
        },
        error: console.error,
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['time'].currentValue) {
      this.form.patchValue(changes['time'].currentValue);
    }
  }

  ngOnDestroy() {
    console.log('destroying');
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  deleteTime() {
    const id = this.form.controls.id.value;
    if (id) {
      this.hqTimeDelete.emit({ id });
    }
  }
  resetTime() {
    this.form.reset({ date: this.form.controls.date.value });
  }

  blurInput(target: EventTarget | null) {
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement
    ) {
      target.blur();
    }
  }
}
