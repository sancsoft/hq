/* eslint-disable rxjs-angular/prefer-async-pipe */
import { StaffDashboardPlanningPointComponent } from './staff-dashboard-planning-point/staff-dashboard-planning-point.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PanelComponent } from './../core/components/panel/panel.component';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { StaffDashboardService } from './service/staff-dashboard.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';

import {
  HQTimeChangeEvent,
  HQTimeDeleteEvent,
  StaffDashboardTimeEntryComponent,
} from './staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import { updateTimeRequestV1 } from '../models/times/update-time-v1';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  skip,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { HQService } from '../services/hq.service';
import { APIError } from '../errors/apierror';
import { ToastService } from '../services/toast.service';
import { ModalService } from '../services/modal.service';
import { StaffDashboardSearchFilterComponent } from './staff-dashboard-search-filter/staff-dashboard-search-filter.component';
import { StaffDashboardDateRangeComponent } from './staff-dashboard-date-range/staff-dashboard-date-range.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeStatus } from '../enums/time-status';
import { Period } from '../enums/period';
import { StatDisplayComponent } from '../core/components/stat-display/stat-display.component';
import { HQRole } from '../enums/hqrole';
import { HQMarkdownComponent } from '../common/markdown/markdown.component';
import { GetPlanResponseV1 } from '../models/Plan/get-plan-v1';
import { localISODate } from '../common/functions/local-iso-date';
import { GetStatusResponseV1 } from '../models/status/get-status-v1';

import { ButtonComponent } from '../core/components/button/button.component';
import { StaffDashboardPlanningComponent } from './staff-dashboard-planning/staff-dashboard-planning.component';
import { GetPrevPlanResponseV1 } from '../models/Plan/get-previous-PSR-v1';
import { ButtonState } from '../enums/button-state';
import { GetChargeCodeRecordV1 } from '../models/charge-codes/get-chargecodes-v1';

export interface PointForm {
  id: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  chargeCode: FormControl<string | null>;
  projectName: FormControl<string | null>;
  projectId: FormControl<string | null>;
  sequence: FormControl<number | null>;
  completed: FormControl<boolean | null>;
}

@Component({
  selector: 'hq-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StaffDashboardTimeEntryComponent,
    StaffDashboardSearchFilterComponent,
    StaffDashboardDateRangeComponent,
    StatDisplayComponent,
    PanelComponent,
    MonacoEditorModule,
    HQMarkdownComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    StaffDashboardPlanningPointComponent,
    ButtonComponent,
    StaffDashboardPlanningComponent,
  ],
  providers: [StaffDashboardService],
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent implements OnInit, OnDestroy, OnChanges {
  Period = Period;
  HQRole = HQRole;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstance: any;
  timeStatus = TimeStatus;
  editorOptions$: Observable<object>;
  status = new FormControl<string | null>(null);
  plan = new FormControl<string | null>(null);
  plan$ = this.plan.valueChanges;

  ButtonState = ButtonState;
  currentDate = new Date();
  previousPlan: string | null = null;
  planResponse$: Observable<GetPlanResponseV1>;
  staffStatus$: Observable<GetStatusResponseV1>;
  prevPlan$: Observable<GetPrevPlanResponseV1 | null>;
  prevPSRReportButtonState: ButtonState = ButtonState.Disabled;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
  canEdit$: Observable<boolean>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @Input({ required: true })
  staffId!: string | null;

  async ngOnInit() {
    // this is added to make sure that the upsert method works in value changes
    this.staffDashboardService.date.setValue(
      this.staffDashboardService.date.value,
    );
    const prevPlan = await firstValueFrom(this.prevPlan$);

    this.staffDashboardService.canEdit$
      .pipe(takeUntil(this.destroyed$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (canEdit) => {
          if (canEdit && prevPlan && prevPlan.body) {
            this.prevPSRReportButtonState = ButtonState.Enabled;
          } else {
            this.prevPSRReportButtonState = ButtonState.Disabled;
          }
          canEdit
            ? this.status.enable({ emitEvent: false })
            : this.status.disable({ emitEvent: false });
          // this.staffDashboardService.canSubmitSubject.next(canEdit); // Submit time button
        },
        error: console.error,
      });

    this.prevPSRReportButtonState =
      prevPlan && prevPlan.body ? ButtonState.Enabled : ButtonState.Disabled;
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  constructor(
    public staffDashboardService: StaffDashboardService,
    private hqService: HQService,
    private toastService: ToastService,
    private modalService: ModalService,
    private oidcSecurityService: OidcSecurityService,
    private cdr: ChangeDetectorRef,
  ) {
    this.canEdit$ = this.staffDashboardService.canEdit$;
    const chargeCodeResponse$ = this.hqService.getChargeCodeseV1({});
    this.chargeCodes$ = chargeCodeResponse$.pipe(
      map((chargeCode) => chargeCode.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    const staffId$ = this.staffDashboardService.staffId$;
    const date$ = staffDashboardService.date.valueChanges
      .pipe(startWith(staffDashboardService.date.value))
      .pipe(map((t) => t || localISODate()));

    const getPlanRequest$ = combineLatest({
      date: date$,
      staffId: staffId$,
    });
    const getStatusRequest$ = combineLatest({
      staffId: staffId$,
    });
    const status$ = this.status.valueChanges;
    const upsertStatusRequest$ = combineLatest({
      staffId: staffId$,
      status: status$,
    });

    this.staffStatus$ = getStatusRequest$.pipe(
      switchMap((request) => {
        return this.hqService.getStatusV1(request);
      }),
      takeUntil(this.destroyed$),
    );
    this.staffStatus$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (staffStatus) => {
        this.status.setValue(staffStatus.status, { emitEvent: false });
      },
      error: console.error,
    });

    upsertStatusRequest$
      .pipe(
        switchMap((request) => {
          return this.hqService.upsertStatus(request);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: () => {
          this.toastService.show('Success', 'Status successfully updated.');
        },
        error: console.error,
      });

    this.planResponse$ = getPlanRequest$.pipe(
      switchMap((request) => {
        return this.hqService.getPlanV1(request);
      }),
      takeUntil(this.destroyed$),
    );
    this.planResponse$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (planResponse) => {
        this.plan.setValue(planResponse.body, {
          onlySelf: true,
          emitEvent: false,
        });
      },
      error: console.error,
    });
    const prevPlanRequest$ = combineLatest({
      date: date$,
      staffId: staffId$,
    }).pipe(distinctUntilChanged());

    this.prevPlan$ = prevPlanRequest$.pipe(
      switchMap((request) => {
        return this.hqService.getPreviousPlanV1(request).pipe(
          catchError((error: unknown) => {
            console.error('Error fetching previous Plan:', error);
            return of(null);
          }),
        );
      }),
    );
    this.prevPlan$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (prevPlan) => {
        this.previousPlan = prevPlan?.body ?? '';
        this.prevPSRReportButtonState =
          prevPlan && prevPlan.body
            ? ButtonState.Enabled
            : ButtonState.Disabled;
      },
      error: console.error,
    });
    const request$ = combineLatest({
      staffId: staffId$,
      body: this.plan$,
      canEdit: this.canEdit$,
    });
    this.staffDashboardService.date.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(() => {
          return request$.pipe(
            skip(1),
            debounceTime(1000),
            filter((t) => t.canEdit),
            switchMap((request) =>
              this.hqService.upsertPlanV1({
                ...request,
                date: this.staffDashboardService.date.value,
              }),
            ),
          );
        }),
        takeUntil(this.destroyed$),
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe,
      .subscribe({
        next: (t) => {
          console.log(t);
          this.toastService.show('Success', 'Plan saved successfully');
        },
        error: async () => {
          this.toastService.show(
            'Error',
            'There was an error saving the report.',
          );
          await firstValueFrom(
            this.modalService.alert(
              'Error',
              'There was an error saving the report.',
            ),
          );
        },
      });
    // Editor options
    this.editorOptions$ = this.staffDashboardService.canEdit$.pipe(
      map((canEdit) => {
        return {
          theme: 'vs-dark',
          language: 'markdown',
          automaticLayout: true,
          readOnly: !canEdit,
          domReadOnly: !canEdit,
          wordWrap: 'on',
        };
      }),
    );
    // this.editorOptions$ = of({
    //   theme: 'vs-dark',
    //   wordWrap: 'on',
    //   language: 'markdown',
    //   automaticLayout: true,
    // });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['staffId'] && this.staffId !== null) {
      this.staffDashboardService.setStaffId(this.staffId);
    }
  }

  insertTextAtCursor() {
    const selection = this.editorInstance.getSelection();
    const id = { major: 1, minor: 1 };
    const op = {
      identifier: id,
      range: selection,
      text: this.previousPlan,
      forceMoveMarkers: false,
    };
    this.editorInstance.executeEdits('my-source', [op]);

    this.editorInstance.focus();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorInit(editor: any) {
    this.editorInstance = editor;
  }

  async duplicateTime(event: HQTimeChangeEvent) {
    if (!event.date) {
      this.toastService.show('Error', 'Time entry has no date');
      return;
    }
    event.hours = null;
    await this.upsertTime(event);
  }
  async deleteTime(event: HQTimeDeleteEvent) {
    const request = {
      id: event.id,
    };

    const confirm = await firstValueFrom(
      this.modalService.confirm(
        'Delete',
        'Are you sure you want to delete this time entry?',
      ),
    );

    if (!confirm) {
      return;
    }

    try {
      await firstValueFrom(this.hqService.deleteTimeV1(request));
      this.toastService.show('Success', 'Time entry successfully deleted.');
      this.staffDashboardService.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else if (err instanceof HttpErrorResponse && err.status == 403) {
        this.toastService.show(
          'Unauthorized',
          'You are not authorized to delete for this date.',
        );
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }

  async upsertTime(event: HQTimeChangeEvent) {
    if (!event.date) {
      return;
    }
    const staffId = await firstValueFrom(this.staffDashboardService.staffId$);

    const request: Partial<updateTimeRequestV1> = {
      staffId: staffId,
      id: event.id,
      hours: event.hours,
      chargeCodeId: event.chargeCodeId,
      task: event.task,
      activityId: event.activityId,
      notes: event.notes,
      date: event.date,
    };

    try {
      await firstValueFrom(this.hqService.upsertTimeV1(request));
      if (event.id) {
        this.toastService.show('Success', 'Time entry successfully updated.');
        this.staffDashboardService.refresh();
        // this.planningPointsRequestTrigger$.next(); // TODO: Trigger this
      } else {
        this.toastService.show('Success', 'Time entry successfully created.');
        this.staffDashboardService.refresh();
        // this.planningPointsRequestTrigger$.next();
      }
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else if (err instanceof HttpErrorResponse && err.status == 403) {
        this.toastService.show(
          'Unauthorized',
          'You are not authorized to create or modify time for this date.',
        );
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }
  handleRejectedTimes() {
    this.staffDashboardService.showAllRejectedTimes$.getValue()
      ? this.hideAllRejectedTimes()
      : this.showAllRejectedTimes();
  }
  private showAllRejectedTimes() {
    this.staffDashboardService.showAllRejectedTimes$.next(true);
    this.staffDashboardService.timeStatus.setValue(TimeStatus.Rejected);
    this.staffDashboardService.period.disable();
  }
  private hideAllRejectedTimes() {
    this.staffDashboardService.showAllRejectedTimes$.next(false);
    this.staffDashboardService.timeStatus.reset();
    this.staffDashboardService.period.enable();
  }
  async submitTimes() {
    const confirm = await firstValueFrom(
      this.modalService.confirm(
        'Submit',
        'Are you sure you want to submit time entries? Once submitted time entries cannot be modified.',
      ),
    );

    if (!confirm) {
      return;
    }
    try {
      const timesIds = await firstValueFrom(
        this.staffDashboardService.time$.pipe(
          map((t) => t.dates.flatMap((d) => d.times.map((time) => time.id))),
        ),
      );
      const staffId = await firstValueFrom(this.staffDashboardService.staffId$);
      if (staffId) {
        const submitTimesRequest = { ids: timesIds, staffId: staffId };
        await firstValueFrom(this.hqService.submitTimesV1(submitTimesRequest));
        this.toastService.show(
          'Success',
          'Time entries successfully submitted.',
        );
        this.hideAllRejectedTimes();
        this.staffDashboardService.refresh();
      } else {
        console.log('ERROR: Could not find staff');
      }
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }
}

export interface PlanPointForm {
  id: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  sequence: FormControl<number | null>;
}
