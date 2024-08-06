import {
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { HQMarkdownComponent } from '../../common/markdown/markdown.component';
import { ButtonComponent } from '../../core/components/button/button.component';
import { PanelComponent } from '../../core/components/panel/panel.component';
import { StatDisplayComponent } from '../../core/components/stat-display/stat-display.component';
import { StaffDashboardDateRangeComponent } from '../staff-dashboard-date-range/staff-dashboard-date-range.component';
import { StaffDashboardPlanningPointComponent } from '../staff-dashboard-planning-point/staff-dashboard-planning-point.component';
import { StaffDashboardSearchFilterComponent } from '../staff-dashboard-search-filter/staff-dashboard-search-filter.component';
import { StaffDashboardTimeEntryComponent } from '../staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  firstValueFrom,
  map,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  skip,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import {
  getPointsResponseV1,
  PlanningPoint,
} from '../../models/Points/get-points-v1';
import { PointForm } from '../staff-dashboard.component';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { localISODate } from '../../common/functions/local-iso-date';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HQService } from '../../services/hq.service';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';
import { StaffDashboardService } from '../service/staff-dashboard.service';
import { GetPlanRequestV1 } from '../../models/Plan/get-plan-v1';

@Component({
  selector: 'hq-staff-dashboard-planning',
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
  templateUrl: './staff-dashboard-planning.component.html',
})
export class StaffDashboardPlanningComponent implements OnInit, OnDestroy {
  // Planning Points
  // planningPointsforms: FormGroup<PointForm>[] = [];
  @ViewChildren(StaffDashboardPlanningPointComponent)
  planningPointsChildren!: QueryList<StaffDashboardPlanningPointComponent>;
  planningPoints$: Observable<getPointsResponseV1 | null>;
  points: PlanningPoint[] = [];
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
  private staffId$: Observable<string>;
  private planningPointsRequest$: Observable<GetPlanRequestV1>;
  private planningPointsRequestTrigger$ = new Subject<void>();
  private editPlanButtonSubject = new BehaviorSubject<boolean>(false);
  editPlanButton$ = this.editPlanButtonSubject.asObservable();
  private disablePlanButtonSubject = new BehaviorSubject<boolean>(false);
  disablePlanButton$ = this.disablePlanButtonSubject.asObservable();
  private planningPointDate$: Observable<string>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  async ngOnInit() {
    // this is added to make sure that the upsert method works in value changes
    this.staffDashboardService.date.setValue(
      this.staffDashboardService.date.value,
    );
    this.staffDashboardService.canEdit$
      .pipe(takeUntil(this.destroyed$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (canEdit) => {
          this.disablePlanButtonSubject.next(!canEdit);
        },
        error: console.error,
      });
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
    // const date$ = staffDashboardService.date.valueChanges
    //   .pipe(startWith(staffDashboardService.date.value))
    //   .pipe(map((t) => t || localISODate()));
    this.staffId$ = this.staffDashboardService.staffId$;
    this.planningPointDate$ =
      staffDashboardService.planningPointdateForm.valueChanges
        .pipe(startWith(staffDashboardService.planningPointdateForm.value))
        .pipe(map((t) => t || localISODate()));

    // const prevPlanRequest$ = combineLatest({
    //   date: date$,
    //   staffId: staffId$,
    // }).pipe(distinctUntilChanged());
    // // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    // prevPlanRequest$.pipe(takeUntil(this.destroyed$)).subscribe((t) => {
    //   console.log(t);
    // });
    this.staffDashboardService.refresh$
      .pipe(takeUntil(this.destroyed$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe,
      .subscribe({
        next: () => {
          this.planningPointsRequestTrigger$.next();
        },
        error: console.error,
      });
    this.planningPointsRequest$ = combineLatest({
      date: this.planningPointDate$,
      staffId: this.staffDashboardService.staffId$,
      trigger: this.planningPointsRequestTrigger$.pipe(startWith(0)),
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    const chargeCodeResponse$ = this.hqService.getChargeCodeseV1({});

    this.chargeCodes$ = chargeCodeResponse$.pipe(
      map((chargeCode) => chargeCode.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.planningPoints$ = this.planningPointsRequest$.pipe(
      switchMap(({ date, staffId }) => {
        return this.hqService.getPlanningPointsV1({ date, staffId }).pipe(
          catchError((error: unknown) => {
            console.error('Error fetching previous Plan:', error);
            return of(null);
          }),
        );
      }),
    );

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    this.planningPoints$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response) => {
        if (response) {
          this.points = response.points;
        }
      },
      error: console.error,
    });

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    this.editPlanButton$.pipe(skip(1), takeUntil(this.destroyed$)).subscribe({
      next: (val) => {
        if (val == false) {
          // means save plan triggered
          try {
            void this.upsertPoints();
          } catch (error) {
            console.error('Error upserting planning points:', error);
          }
        }
      },
      error: console.error,
    });
  }
  onDrop(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.points, event.previousIndex, event.currentIndex);

    this.updateSequence();
  }

  updateSequence(): void {
    this.points.forEach((point, idx) => {
      // form.controls['sequence'].setValue(idx + 1);
      this.points[idx].sequence = idx + 1;
    });
  }

  createForm(data: PlanningPoint): FormGroup<PointForm> {
    return new FormGroup({
      id: new FormControl<string | null>(data.id),
      chargeCodeId: new FormControl<string | null>(data.chargeCodeId),
      chargeCode: new FormControl<string | null>(data.chargeCode),
      projectName: new FormControl<string | null>(data.projectName),

      projectId: new FormControl<string | null>(data.projectId),

      completed: new FormControl<boolean | null>(data.completed),

      sequence: new FormControl<number>(data.sequence, {
        validators: [Validators.required],
      }),
    });
  }

  async upsertPoints() {
    try {
      const date = this.staffDashboardService.planningPointdateForm.value;
      const staffId = await firstValueFrom(this.staffDashboardService.staffId$);
      // const points = this.getPlanningPointsFormValues();
      const points = this.planningPointsChildren.map(
        (t) => t.form.value as PlanningPoint,
      );
      const request = {
        date,
        staffId,
        points,
      };

      await firstValueFrom(this.hqService.upsertPlanningPointsV1(request));

      this.toastService.show(
        'Success',
        'Planning points successfully upserted.',
      );

      // Trigger the refresh of planning points
      this.planningPointsRequestTrigger$.next();
    } catch (error) {
      console.error('Error upserting planning points:', error);
    }
  }

  async prevPlanningPoint() {
    const planningPoints = await firstValueFrom(this.planningPoints$);
    if (planningPoints?.previousDate) {
      this.staffDashboardService.planningPointdateForm.setValue(
        planningPoints.previousDate,
      );
    }
  }
  async nextPlanningPoint() {
    const planningPoints = await firstValueFrom(this.planningPoints$);
    if (planningPoints?.nextDate) {
      this.staffDashboardService.planningPointdateForm.setValue(
        planningPoints.nextDate,
      );
    }
  }
  toggleButtonValue() {
    this.editPlanButtonSubject.next(!this.editPlanButtonSubject.value);
  }
}
