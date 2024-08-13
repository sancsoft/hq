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
  GetPointSummaryV1StaffSummary,
} from '../../models/Points/get-points-summary-v1';
import { RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { formControlChanges } from '../../core/functions/form-control-changes';
import { PlanningPointsModalComponent } from '../planning-points-modal/planning-points-modal.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'hq-planning-points',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './planning-points.component.html',
})
export class PlanningPointsComponent implements OnDestroy {
  search = new FormControl<string | null>(null);
  search$ = formControlChanges(this.search);

  date = new BehaviorSubject<string>(localISODate());
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
    }).pipe(
      debounceTime(500),
      tap(() => this.loading.next(true)),
      switchMap((t) =>
        this.hqService.getPointsSummaryV1({
          date: t.date,
          search: t.search,
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
}
