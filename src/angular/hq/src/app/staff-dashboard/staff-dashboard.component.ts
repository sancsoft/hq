import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PanelComponent } from './../core/components/panel/panel.component';
import { Component, OnInit } from '@angular/core';
import { StaffDashboardService } from './service/staff-dashboard.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Period } from '../models/times/get-time-v1';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';

import {
  HQTimeChangeEvent,
  HQTimeDeleteEvent,
  StaffDashboardTimeEntryComponent,
} from './staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import { updateTimeRequestV1 } from '../models/times/update-time-v1';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  Observable,
  of,
  ReplaySubject,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { HQService } from '../services/hq.service';
import { APIError } from '../errors/apierror';
import { ToastService } from '../services/toast.service';
import { ModalService } from '../services/modal.service';
import { StaffDashboardSearchFilterComponent } from './staff-dashboard-search-filter/staff-dashboard-search-filter.component';
import { StaffDashboardDateRangeComponent } from './staff-dashboard-date-range/staff-dashboard-date-range.component';
import { TimeStatus } from '../models/common/time-status';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpErrorResponse } from '@angular/common/http';
import { StatDisplayComponent } from '../core/components/stat-display/stat-display.component';
import { HQRole } from '../enums/hqrole';
import { HQMarkdownComponent } from '../common/markdown/markdown.component';
import { ButtonState } from '../enums/ButtonState';
import { GetPlanResponseV1 } from '../models/Plan/get-plan-v1';
import { localISODate } from '../common/functions/local-iso-date';
import { GetStatusResponseV1 } from '../models/status/get-status-v1';
import { GetPrevPlanResponseV1 } from '../models/Plan/get-previous-PSR-v1';
import {
  getPointsResponseV1,
  PlanningPoint,
} from '../models/Points/get-points-v1';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  quantity: number;
}

export const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', quantity: 100 },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', quantity: 100 },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', quantity: 100 },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    quantity: 100,
  },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B', quantity: 100 },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', quantity: 100 },
  {
    position: 7,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    quantity: 100,
  },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', quantity: 100 },
  {
    position: 9,
    name: 'Fluorine',
    weight: 18.9984,
    symbol: 'F',
    quantity: 100,
  },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', quantity: 100 },
];

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
  ],
  providers: [StaffDashboardService],
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent implements OnInit {
  Period = Period;
  HQRole = HQRole;

  // Planning Points
  planningPointsforms: FormGroup[] = [];
  planningPoints$: Observable<getPointsResponseV1 | null>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstance: any;
  timeStatus = TimeStatus;
  editorOptions$: Observable<object>;
  status = new FormControl<string | null>(null);
  plan = new FormControl<string | null>(null);
  plan$ = this.plan.valueChanges;

  prevPSRReportButtonState: ButtonState = ButtonState.Disabled;
  ButtonState = ButtonState;
  currentDate = new Date();
  previousPlan: string | null = null;
  planResponse$: Observable<GetPlanResponseV1>;
  staffStatus$: Observable<GetStatusResponseV1>;
  prevPlan$: Observable<GetPrevPlanResponseV1 | null>;
  dataSource = ELEMENT_DATA;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
    this.dataSource.forEach((user, idx) => {
      user.position = idx + 1;
    });
  }

  async ngOnInit() {
    // this is added to make sure that the upsert method works in value changes
    this.staffDashboardService.date.setValue(
      this.staffDashboardService.date.value,
    );
    const prevPlan = await firstValueFrom(this.prevPlan$);
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
  ) {
    const staffId$ = oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map((t) => t.staff_id as string),
      distinctUntilChanged(),
    );
    const date$ = staffDashboardService.date.valueChanges
      .pipe(startWith(staffDashboardService.date.value))
      .pipe(map((t) => t || localISODate()));

    const prevPlanRequest$ = combineLatest({
      date: date$,
      staffId: staffId$,
    }).pipe(distinctUntilChanged());
    prevPlanRequest$.subscribe((t) => {
      console.log(t);
    });
    const planningPointsRequest$ = combineLatest({
      date: date$,
      staffId: staffId$,
    });
    this.planningPoints$ = planningPointsRequest$.pipe(
      switchMap((request) => {
        return this.hqService.getPlanningPointsV1(request).pipe(
          catchError((error: unknown) => {
            console.error('Error fetching previous Plan:', error);
            return of(null);
          }),
        );
      }),
    );
    this.planningPoints$.subscribe((response) => {
      if (response) {
        this.initializeForms(response.points);
      }
    });
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
    this.prevPlan$.subscribe((prevPlan) => {
      this.previousPlan = prevPlan?.body ?? '';
      this.prevPSRReportButtonState =
        prevPlan && prevPlan.body ? ButtonState.Enabled : ButtonState.Disabled;
    });

    const getPlanRequest$ = combineLatest({
      date: date$,
      staffId: staffId$,
    });
    const getStatusRequest$ = combineLatest({
      staffId: staffId$,
    });
    const status$ = this.status.valueChanges;
    this.status.valueChanges.subscribe((status) => console.log(status));
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
    this.staffStatus$.subscribe((staffStatus) => {
      this.status.setValue(staffStatus.status);
    });

    upsertStatusRequest$
      .pipe(
        skip(1),
        switchMap((request) => {
          return this.hqService.upsertStatus(request);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.planResponse$ = getPlanRequest$.pipe(
      switchMap((request) => {
        return this.hqService.getPlanV1(request);
      }),
      takeUntil(this.destroyed$),
    );
    this.planResponse$.subscribe((planResponse) => {
      this.plan.setValue(planResponse.body, {
        onlySelf: true,
        emitEvent: false,
      });
    });
    const request$ = combineLatest({
      staffId: staffId$.pipe(tap((t) => console.log('staffId', t))),
      body: this.plan$.pipe(tap((t) => console.log('plan', t))),
    });
    this.staffDashboardService.date.valueChanges
      .pipe(
        switchMap((date) => {
          return request$.pipe(
            skip(1),
            debounceTime(1000),
            switchMap((request) =>
              this.hqService.upsertPlanV1({
                ...request,
                date: this.staffDashboardService.date.value,
              }),
            ),
            takeUntil(this.destroyed$),
          );
        }),
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: () => {
          this.toastService.show('Success', 'PSR Report Saved Successfully');
        },
        error: async () => {
          this.toastService.show(
            'Error',
            'There was an error saving the PM report.',
          );
          await firstValueFrom(
            this.modalService.alert(
              'Error',
              'There was an error saving the PM report.',
            ),
          );
        },
      });

    // Editor options
    this.editorOptions$ = of({
      theme: 'vs-dark',
      language: 'markdown',
      automaticLayout: true,
    });
  }
  monacoChange(e: any) {
    console.log('Monaco editor changed');
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

    const request: Partial<updateTimeRequestV1> = {
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
      } else {
        this.toastService.show('Success', 'Time entry successfully created.');
        this.staffDashboardService.refresh();
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
      const staffId = await firstValueFrom(
        this.oidcSecurityService.userData$.pipe(
          map((t) => t.userData?.staff_id),
        ),
      );
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

  createForm(data: PlanningPoint): FormGroup<PlanPointForm> {
    return new FormGroup({
      id: new FormControl<string | null>(data.id),
      chargeCodeId: new FormControl<string | null>(data.chargeCodeId),
      sequence: new FormControl<number>(data.sequence, {
        validators: [Validators.required],
      }),
    });
  }
  initializeForms(points: PlanningPoint[]): void {
    this.planningPointsforms = points.map((point) => this.createForm(point));
  }
}

export interface PlanPointForm {
  id: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  sequence: FormControl<number | null>;
}
