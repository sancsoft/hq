/* eslint-disable rxjs-angular/prefer-async-pipe */
import { SelectInputComponent } from './../../core/components/select-input/select-input.component';
import { SelectInputOptionDirective } from './../../core/directives/select-input-option.directive';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GetDashboardTimeV1TimeForDateTimes } from '../../models/staff-dashboard/get-dashboard-time-v1';
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
  concat,
  defer,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  shareReplay,
  takeUntil,
  combineLatest,
} from 'rxjs';
import { roundToNextQuarter } from '../../common/functions/round-to-next-quarter';
import { chargeCodeToColor } from '../../common/functions/charge-code-to-color';
import { ModalService } from '../../services/modal.service';
import { TimeStatus } from '../../enums/time-status';
import { DateInputComponent } from '../../core/components/date-input/date-input.component';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { GetProjectActivityRecordV1 } from '../../models/projects/get-project-activity-v1';

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
  clientName: FormControl<string | null>;
  projectName: FormControl<string | null>;
  clientId: FormControl<string | null>;
  projectId: FormControl<string | null>;
  activityId: FormControl<string | null>;
}

@Component({
  selector: 'tr[hq-staff-dashboard-time-entry]',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DateInputComponent,
    SelectInputOptionDirective,
    SelectInputComponent,
  ],
  templateUrl: './staff-dashboard-time-entry.component.html',
})
export class StaffDashboardTimeEntryComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input()
  time?: Partial<GetDashboardTimeV1TimeForDateTimes>;
  @Input()
  chargeCodes: GetChargeCodeRecordV1[] | null = [];

  @Output()
  hqTimeChange = new EventEmitter<HQTimeChangeEvent>();

  @Output()
  hqTimeDelete = new EventEmitter<HQTimeDeleteEvent>();

  @Output()
  hqTimeDuplicate = new EventEmitter<HQTimeChangeEvent>();

  @HostBinding('class')
  class = 'even:bg-gray-850 odd:bg-black-alt';

  private destroyed$ = new Subject<void>();

  chargeCodeToColor = chargeCodeToColor;

  @ViewChild('hoursInput') hoursInput!: ElementRef<HTMLInputElement>;

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
    chargeCodeId: new FormControl<string | null>(null, {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    clientName: new FormControl<string | null>(null),
    projectName: new FormControl<string | null>(null),

    clientId: new FormControl<string | null>(null, {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    projectId: new FormControl<string | null>(null, {
      updateOn: 'change',
      validators: [Validators.required],
    }),
    activityId: new FormControl<string | null>(null),
  });

  projectName$: Observable<string | null | undefined>;
  clientName$: Observable<string | null | undefined>;
  timeStatus = TimeStatus;
  filteredActivities$: Observable<GetProjectActivityRecordV1[]>;
  ngOnInit(): void {
    this.staffDashboardService.canEdit$
      .pipe(takeUntil(this.destroyed$))
      // eslint-disable-next-line rxjs/no-ignored-error
      .subscribe((canEdit) => {
        canEdit
          ? this.form.enable({ emitEvent: false })
          : this.form.disable({ emitEvent: false });
      });

    this.form.controls.chargeCodeId.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (id) => {
          const chargeCode = this.chargeCodes?.find((t) => t.id === id);
          const maxTimeEntryHours = chargeCode?.maximumTimeEntryHours ?? 0;
          console.log(chargeCode, this.chargeCodes, id);
          this.setMaximumHours(maxTimeEntryHours);
          if (chargeCode) {
            this.form.patchValue(
              {
                clientId: chargeCode.clientId,
                projectId: chargeCode.projectId,
                clientName: chargeCode.clientName,
                projectName: chargeCode.projectName,
                activityId: null,
              },
              { emitEvent: false },
            );
          } else {
            this.form.patchValue(
              {
                clientId: null,
                projectId: null,
                clientName: null,
                projectName: null,
                activityId: null,
              },
              { emitEvent: false },
            );
          }
        },
        error: console.error,
      });
  }
  constructor(
    public staffDashboardService: StaffDashboardService,
    private modalService: ModalService,
  ) {
    const form$ = concat(
      defer(() => of(this.form.value)),
      this.form.valueChanges,
    ).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.projectName$ = form$.pipe(
      map((t) => t.projectName),
      distinctUntilChanged(),
    );
    this.clientName$ = form$.pipe(
      map((t) => t.clientName),
      distinctUntilChanged(),
    );

    this.filteredActivities$ = combineLatest({
      activities: staffDashboardService.activities$,
      form: form$,
    }).pipe(
      map((t) => t.activities.filter((x) => x.projectId === t.form.projectId)),
    );

    const hours$ = form$.pipe(
      map((t) => t.hours),
      distinctUntilChanged(),
    );

    // clientId$.pipe(takeUntil(this.destroyed$)).subscribe({
    //   next: () => {
    //     this.form.patchValue(
    //       {
    //         chargeCodeId: null,
    //         projectId: null,
    //         chargeCode: null,
    //       },
    //       { emitEvent: false },
    //     );
    //   },
    //   error: console.error,
    // });

    // project$.pipe(takeUntil(this.destroyed$)).subscribe({
    //   next: (project) => {
    //     if (project) {
    //       this.form.patchValue(
    //         {
    //           chargeCodeId: project.chargeCodeId,
    //           chargeCode: project.chargeCode,
    //         },
    //         { emitEvent: false },
    //       );
    //     } else {
    //       this.form.patchValue(
    //         {
    //           chargeCodeId: null,
    //           chargeCode: null,
    //         },
    //         { emitEvent: false },
    //       );
    //     }
    //   },
    //   error: console.error,
    // });

    hours$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (hours) => {
        if (hours != null) {
          this.form.patchValue({ hours: roundToNextQuarter(hours) });
        }
      },
      error: console.error,
    });

    this.staffDashboardService.refresh$
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          if (!this.time?.id) {
            this.resetTime();
          }
        },
        error: console.error,
      });
  }

  async onEnter(target: EventTarget | null) {
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement
    ) {
      target.blur();
    }
  }

  async save() {
    if (this.form.valid && this.form.dirty) {
      this.hqTimeChange.emit(this.form.value);
      this.form.markAsPristine();
      if (!this.form.value.id) {
        this.hoursInput?.nativeElement?.focus();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['time'] && changes['time'].currentValue) {
      this.form.patchValue(changes['time'].currentValue);
      if (this.form.value.id) {
        // Force validation to run and highlight invalid fields red
        this.form.markAllAsTouched();
      }
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  deleteTime() {
    const id = this.form.controls.id.value;
    if (id) {
      this.hqTimeDelete.emit({ id });
    }
  }
  async duplicateTime() {
    const newDate = await firstValueFrom(
      this.modalService.chooseDate(
        'Duplicate Time Entry',
        'Choose the date where you would like to duplicate this time entry to',
        this.form.controls.date.value ?? '',
      ),
    );
    if (newDate) {
      const cutoffDate = await firstValueFrom(
        this.staffDashboardService.timeEntryCutoffDate$,
      );
      if (newDate >= cutoffDate) {
        const time = { ...this.form.value };
        time.date = newDate;
        time.id = null; // to create a new time
        this.hqTimeDuplicate.emit(time);
        this.staffDashboardService.date.setValue(time.date);
      } else {
        await firstValueFrom(
          this.modalService.alert(
            'Error',
            'Cannot copy outside of current week period',
          ),
        );
      }
    }
  }
  resetTime() {
    this.form.reset({ date: this.form.controls.date.value });
  }
  async chooseDate() {
    if (!this.form.value.id || !this.form.valid) {
      return;
    }

    const newDate = await firstValueFrom(
      this.modalService.chooseDate(
        'Change Date',
        'Changing the date may make the time entry disappear from view.',
        this.form.controls.date.value ?? '',
      ),
    );
    if (newDate) {
      this.form.patchValue({ date: newDate });
      this.form.markAsDirty();
      await this.save();
    }
  }

  async showRejectionNotes() {
    if (this.time?.rejectionNotes) {
      await this.modalService.alert('Rejection', this.time.rejectionNotes);
    }
  }

  private setMaximumHours(maxTime?: number): void {
    const maxTimeEntry = maxTime ?? this.time?.maximumTimeEntryHours;
    if (maxTimeEntry !== undefined && maxTimeEntry !== null) {
      this.form.controls.hours.setValidators([
        Validators.required,
        Validators.min(0.25),
        Validators.max(maxTimeEntry),
      ]);
      this.form.controls.hours.updateValueAndValidity();
    }
  }
}
