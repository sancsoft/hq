import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  Dialog,
  DialogRef,
  DIALOG_DATA,
  DialogModule,
} from '@angular/cdk/dialog';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CdkDropList,
  CdkDrag,
  CdkDragPlaceholder,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { HQMarkdownComponent } from '../../common/markdown/markdown.component';
import { ButtonComponent } from '../../core/components/button/button.component';
import { PanelComponent } from '../../core/components/panel/panel.component';
import { StatDisplayComponent } from '../../core/components/stat-display/stat-display.component';
import { StaffDashboardDateRangeComponent } from '../../staff-dashboard/staff-dashboard-date-range/staff-dashboard-date-range.component';
import {
  PointForm,
  StaffDashboardPlanningPointComponent,
} from '../../staff-dashboard/staff-dashboard-planning-point/staff-dashboard-planning-point.component';
import { StaffDashboardPlanningComponent } from '../../staff-dashboard/staff-dashboard-planning/staff-dashboard-planning.component';
import { StaffDashboardSearchFilterComponent } from '../../staff-dashboard/staff-dashboard-search-filter/staff-dashboard-search-filter.component';
import { StaffDashboardTimeEntryComponent } from '../../staff-dashboard/staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  map,
  Observable,
  ReplaySubject,
  shareReplay,
  Subject,
} from 'rxjs';
import {
  getPointsResponseV1,
  PlanningPoint,
} from '../../models/Points/get-points-v1';
import {
  GetChargeCodeRecordV1,
  SortColumn,
} from '../../models/charge-codes/get-chargecodes-v1';
import { GetPlanRequestV1 } from '../../models/Plan/get-plan-v1';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HQService } from '../../services/hq.service';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';

export interface DialogData {
  title: string;
  staffId: string;
  date: string;
}
@Component({
  selector: 'hq-planning-points-modal',
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
  templateUrl: './planning-points-modal.component.html',
})
export class PlanningPointsModalComponent implements OnInit, OnDestroy {
  @ViewChildren(StaffDashboardPlanningPointComponent)
  planningPointsChildren!: QueryList<StaffDashboardPlanningPointComponent>;
  chargeCodes?: GetChargeCodeRecordV1[];

  points: PlanningPoint[] = [];
  private planningPointsRequestTrigger$ = new Subject<void>();
  private editPlanButtonSubject = new BehaviorSubject<boolean>(false);
  editPlanButton$ = this.editPlanButtonSubject.asObservable();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  planningPointsRequest$: any;

  async ngOnInit() {
    this.getChargeCodes();
    console.log(
      'PlanningPointsModalComponent',
      this.data.date,
      this.data.staffId,
    );
    const date = this.data.date;
    const staffId = this.data.staffId;
    this.hqService;
    this.hqService.getPlanningPointsV1({ date, staffId }).subscribe({
      next: (response) => {
        if (response) {
          this.points = response.points;
        }
      },
      error: console.error,
    });
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: DialogData,
    private hqService: HQService,
    private toastService: ToastService,
    private modalService: ModalService,
    private oidcSecurityService: OidcSecurityService,
    private cdr: ChangeDetectorRef,
  ) {}

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
      const date = this.data.date;
      const staffId = this.data.staffId;
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

  private getChargeCodes() {
    this.hqService
      .getChargeCodeseV1({
        active: true,
        staffId: this.data.staffId,
        sortBy: SortColumn.IsProjectMember,
      })
      .pipe(
        map((chargeCode) => chargeCode.records),
        shareReplay({ bufferSize: 1, refCount: false }),
      )
      .subscribe({
        next: (records) => {
          this.chargeCodes = records;
        },
      });
  }
}
function switchMap(
  arg0: ({ date, staffId }: { date: any; staffId: any }) => Observable<unknown>,
): any {
  throw new Error('Function not implemented.');
}

function of(arg0: null) {
  throw new Error('Function not implemented.');
}
function takeUntil(
  destroyed$: ReplaySubject<boolean>,
): import('rxjs').OperatorFunction<getPointsResponseV1, unknown> {
  throw new Error('Function not implemented.');
}
