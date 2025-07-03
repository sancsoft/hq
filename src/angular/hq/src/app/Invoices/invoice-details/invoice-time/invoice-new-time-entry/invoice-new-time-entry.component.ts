import { SelectInputComponent } from './../../../../core/components/select-input/select-input.component';
import { SelectInputOptionDirective } from './../../../../core/directives/select-input-option.directive';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
  BehaviorSubject,
  switchMap,
} from 'rxjs';
import { roundToNextQuarter } from '../../../../common/functions/round-to-next-quarter';
import { chargeCodeToColor } from '../../../../common/functions/charge-code-to-color';
import { ModalService } from '../../../../services/modal.service';
import { TimeStatus } from '../../../../enums/time-status';
import { GetChargeCodeRecordV1 } from '../../../../models/charge-codes/get-chargecodes-v1';
import { GetProjectActivityRecordV1 } from '../../../../models/projects/get-project-activity-v1';
import { GetDashboardTimeV1TimeForDateTimes } from '../../../../models/staff-dashboard/get-dashboard-time-v1';
import { InvoiceDetaisService } from '../../../service/invoice-details.service';
import { HQService } from '../../../../services/hq.service';

export interface HQInvoiceTimeChangeEvent {
  id?: string | null;
  staffId?: string | null;
  date?: string | null;
  hours?: number | null;
  invoicedHours?: number | null;
  invoiceId?: string | null;
  notes?: string | null;
  task?: string | null;
  chargeCodeId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  activityId?: string | null;
}

interface Form {
  id: FormControl<string | null>;
  staffId: FormControl<string | null>;
  date: FormControl<string | null>;
  hours: FormControl<number | null>;
  invoicedHours: FormControl<number | null>;
  notes: FormControl<string | null>;
  task: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  clientName: FormControl<string | null>;
  projectName: FormControl<string | null>;
  clientId: FormControl<string | null>;
  projectId: FormControl<string | null>;
  activityId: FormControl<string | null>;
}

@Component({
  selector: 'tr[hq-invoice-new-time-entry]',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectInputOptionDirective,
    SelectInputComponent,
  ],
  templateUrl: './invoice-new-time-entry.component.html',
})
export class InvoiceNewTimeEntryComponent implements OnChanges, OnDestroy {
  @Input()
  time?: Partial<GetDashboardTimeV1TimeForDateTimes>;
  @Input()
  chargeCodes: GetChargeCodeRecordV1[] | null = [];
  @Input()
  enableChooseDate: boolean = false;
  @Output()
  hqInvoiceTimeChange = new EventEmitter<HQInvoiceTimeChangeEvent>();

  @HostBinding('class')
  class = 'even:bg-gray-850 odd:bg-black-alt';

  private destroyed$ = new Subject<void>();

  chargeCodeToColor = chargeCodeToColor;

  @ViewChild('hoursInput') hoursInput!: ElementRef<HTMLInputElement>;

  form = new FormGroup<Form>({
    id: new FormControl<string | null>(null),
    staffId: new FormControl<string | null>(null, {
      updateOn: 'change',
      validators: [Validators.required, Validators.minLength(1)],
    }),
    date: new FormControl<string | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    hours: new FormControl<number | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.min(0.25)],
    }),
    invoicedHours: new FormControl<number | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required, Validators.min(0.25)],
    }),
    notes: new FormControl<string | null>(null, {
      updateOn: 'blur',
      validators: [Validators.required],
    }),
    task: new FormControl<string | null>(null, { updateOn: 'blur' }),
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
  requireTask$ = new BehaviorSubject<boolean>(false);

  constructor(
    public invoiceDetailsService: InvoiceDetaisService,
    private modalService: ModalService,
    private hqService: HQService,
  ) {
    const form$ = concat(
      defer(() => of(this.form.value)),
      this.form.valueChanges,
    ).pipe(
      map((t) => {
        if (t.hours != null) {
          this.form.patchValue(
            { hours: roundToNextQuarter(t.hours) },
            { emitEvent: false },
          );
        }
        if (t.invoicedHours != null) {
          this.form.patchValue(
            { invoicedHours: roundToNextQuarter(t.invoicedHours) },
            { emitEvent: false },
          );
        }
        return t;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.projectName$ = form$.pipe(
      map((t) => t?.projectName),
      distinctUntilChanged(),
    );
    this.clientName$ = form$.pipe(
      map((t) => t?.clientName),
      distinctUntilChanged(),
    );

    this.filteredActivities$ = form$.pipe(
      map((t) => t?.projectId),
      distinctUntilChanged(),
      switchMap((id) => {
        if (id != null && id != undefined) {
          return this.hqService.getprojectActivitiesV1({ projectId: id }).pipe(
            map((response) => {
              if (response.records.length > 0) {
                this.form.controls.activityId.addValidators(
                  Validators.required,
                );
              } else {
                this.form.controls.activityId.removeValidators(
                  Validators.required,
                );
              }
              this.form.controls.activityId.updateValueAndValidity({
                emitEvent: false,
              });
              return response.records;
            }),
          );
        } else {
          return of();
        }
      }),
      takeUntil(this.destroyed$),
    );
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
      this.hqInvoiceTimeChange.emit(this.form.value);
      this.form.reset();
      this.form.markAsPristine();
      if (!this.form.value.id) {
        this.hoursInput?.nativeElement?.focus();
      }
    }
  }

  async saveChargeCode() {
    if (this.form.value.chargeCodeId != null) {
      console.log('Save charge code');
      const chargeCode = this.chargeCodes?.find(
        (c) => c.id === this.form.value.chargeCodeId,
      );
      const maxTimeEntryHours = chargeCode?.maximumTimeEntryHours ?? 4;
      this.setMaximumHours(maxTimeEntryHours);
      // set requireTask to true if the charge code project requires a task
      this.requireTask$.next(chargeCode?.requireTask ?? false);
      const taskControl = this.form.controls.task;
      if (chargeCode?.requireTask ?? false) {
        taskControl.addValidators(Validators.required);
      } else {
        taskControl.removeValidators(Validators.required);
      }
      taskControl.updateValueAndValidity({ emitEvent: false });
      if (chargeCode) {
        this.form.patchValue({
          clientId: chargeCode.clientId,
          projectId: chargeCode.projectId,
          clientName: chargeCode.clientName,
          projectName: chargeCode.projectName,
          activityId: null,
        });
      } else {
        this.form.patchValue({
          clientId: null,
          projectId: null,
          clientName: null,
          projectName: null,
          activityId: null,
        });
      }
    }
    if (this.form.valid && this.form.dirty) {
      this.hqInvoiceTimeChange.emit(this.form.value);
      this.form.reset();
      this.form.markAsPristine();
      if (!this.form.value.id) {
        this.hoursInput?.nativeElement?.focus();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['time'] && changes['time'].currentValue) {
      this.form.patchValue(changes['time'].currentValue);
      if (this.form.value.chargeCodeId) {
        const id = this.form.value.chargeCodeId;
        const chargeCode = this.chargeCodes?.find((t) => t.id === id);
        const maxTimeEntryHours = chargeCode?.maximumTimeEntryHours ?? 4;
        this.setMaximumHours(maxTimeEntryHours);
        // set requireTask to true if the charge code project requires a task
        this.requireTask$.next(chargeCode?.requireTask ?? false);
      }
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

  resetTime() {
    this.form.reset({ date: this.form.controls.date.value });
  }
  async chooseDate() {
    const newDate = await firstValueFrom(
      this.modalService.chooseDate(
        'Change Date',
        'Choose a date for a new time entry to be created on.',
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
    console.log(maxTime);
    const maxTimeEntry = maxTime ?? this.time?.maximumTimeEntryHours;
    if (maxTimeEntry !== undefined && maxTimeEntry !== null) {
      this.form.controls.hours.setValidators([
        Validators.required,
        Validators.min(0.25),
        Validators.max(maxTimeEntry),
      ]);
      this.form.controls.invoicedHours.setValidators([
        Validators.required,
        Validators.min(0.25),
        Validators.max(maxTimeEntry),
      ]);
      this.form.controls.hours.updateValueAndValidity({
        emitEvent: false,
      });
      this.form.controls.invoicedHours.updateValueAndValidity({
        emitEvent: false,
      });
    }
  }
}
