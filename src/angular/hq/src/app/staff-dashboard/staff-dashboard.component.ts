import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PanelComponent } from './../core/components/panel/panel.component';
import { Component, OnInit } from '@angular/core';
import { StaffDashboardService } from './service/staff-dashboard.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Period } from '../models/times/get-time-v1';
import {
  HQTimeChangeEvent,
  HQTimeDeleteEvent,
  StaffDashboardTimeEntryComponent,
} from './staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import { updateTimeRequestV1 } from '../models/times/update-time-v1';
import {
  BehaviorSubject,
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
  ],
  providers: [StaffDashboardService],
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent implements OnInit {
  Period = Period;
  HQRole = HQRole;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstance: any;
  timeStatus = TimeStatus;
  editorOptions$: Observable<object>;
  plan = new FormControl<string | null>(null);
  plan$ = this.plan.valueChanges;

  prevPSRReportButtonState: ButtonState = ButtonState.Disabled;
  ButtonState = ButtonState;
  currentDate = new Date();
  previousReport: string | null = null;
  planResponse$: Observable<GetPlanResponseV1>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  async ngOnInit() {
    // this is added to make sure that the upsert method works in value changes
    this.staffDashboardService.date.setValue(
      this.staffDashboardService.date.value,
    );
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

    const getPlanRequest$ = combineLatest({
      date: date$,
      staffId: staffId$,
    });

    this.planResponse$ = getPlanRequest$.pipe(
      switchMap((request) => {
        // this.plan.setValue('', { emitEvent: false });
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
          console.log(date);
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
      text: this.previousReport,
      forceMoveMarkers: true,
    };
    this.editorInstance.executeEdits('my-source', [op]);
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
}
