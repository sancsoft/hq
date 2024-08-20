import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { CoreModule } from '../../core/core.module';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  Observable,
  ReplaySubject,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { localISODate } from '../../common/functions/local-iso-date';
import { HQService } from '../../services/hq.service';
import { chargeCodeToColor } from '../../common/functions/charge-code-to-color';
import {
  GetPointsSummaryResponseV1,
  GetPointsSummaryPlanningPoint,
  GetPointSummaryV1StaffSummary,
} from '../../models/Points/get-points-summary-v1';
import { RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { formControlChanges } from '../../core/functions/form-control-changes';
import { PlanningPointsModalComponent } from '../planning-points-modal/planning-points-modal.component';
import { Dialog } from '@angular/cdk/dialog';
import { SelectInputComponent } from '../../core/components/select-input/select-input.component';

@Component({
  selector: 'hq-planning-points',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    SelectInputComponent,
  ],
  templateUrl: './planning-points.component.html',
})
export class PlanningPointsComponent implements OnDestroy {
  search = new FormControl<string | null>(null);
  isCompleted = new FormControl<boolean | null>(null);

  search$ = formControlChanges(this.search);
  isCompleted$ = formControlChanges(this.isCompleted);

  date = new BehaviorSubject<string>(localISODate());
  opacity = new BehaviorSubject<number>(0.25);

  loading = new BehaviorSubject<boolean>(true);
  refresh$ = new BehaviorSubject<boolean>(false);

  chargeCodeToColor = chargeCodeToColor;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  summary$: Observable<GetPointsSummaryResponseV1>;

  constructor(
    public hqService: HQService,
    public dialog: Dialog,
  ) {
    this.summary$ = combineLatest({
      date: this.date,
      search: this.search$,
      refresh: this.refresh$,
      isCompleted: this.isCompleted$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loading.next(true)),
      switchMap((t) =>
        this.hqService.getPointsSummaryV1({
          date: t.date,
          search: t.search,
          isCompleted: t.isCompleted,
        }),
      ),
      tap(() => this.loading.next(false)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getDisplayName(point: GetPointsSummaryPlanningPoint) {
    let displayName = `${point.chargeCode![0]}: ${point.clientName}: ${point.projectName}`;
    if (displayName.length > 20) {
      displayName = displayName.slice(0, 18) + '..';
    }

    return displayName;
  }

  editStaffPlanningPoint(staff: GetPointSummaryV1StaffSummary) {
    const dialogRef = this.dialog.open<boolean>(PlanningPointsModalComponent, {
      width: '600px',
      data: {
        staffId: staff.staffId,
        date: this.date.value,
      },
    });

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    dialogRef.closed.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (result) => {
        console.log('The dialog was closed', result);
        if (result) {
          this.refresh$.next(true);
        }
      },
      error: console.error,
    });
  }
  configureChargeCodeColorOpacity(point: GetPointsSummaryPlanningPoint) {
    const chargeCodeId = point.chargeCodeId;
    const defaultOpacity = 0.25;
    const matchingOpacity = 0.5;
    const nonMatchingOpacity = 0.05;

    const searchValue = this.search.value?.toLowerCase();

    if (!searchValue?.trim().length) {
      return chargeCodeToColor(chargeCodeId, defaultOpacity);
    }

    return this.isNonMatched(point)
      ? chargeCodeToColor(chargeCodeId, nonMatchingOpacity)
      : chargeCodeToColor(chargeCodeId, matchingOpacity);
  }

  isNonMatched(point: GetPointsSummaryPlanningPoint) {
    const searchValue = this.search.value?.toLowerCase();

    if (!searchValue?.trim().length) {
      return false;
    }

    if (
      point.clientName?.toLowerCase()?.includes(searchValue) ||
      point.projectName?.toLowerCase()?.includes(searchValue) ||
      point.chargeCode?.toLowerCase()?.includes(searchValue)
    ) {
      return false;
    }

    return true;
  }
}
