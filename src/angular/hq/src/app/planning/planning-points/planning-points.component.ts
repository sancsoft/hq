import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoreModule } from '../../core/core.module';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  Observable,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { localISODate } from '../../common/functions/local-iso-date';
import { HQService } from '../../services/hq.service';
import { chargeCodeToColor } from '../../common/functions/charge-code-to-color';
import {
  GetPointsSummaryPlanningPoint,
  GetPointsSummaryResponseV1,
} from '../../models/Points/get-points-summary-v1';
import { RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { formControlChanges } from '../../core/functions/form-control-changes';
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
export class PlanningPointsComponent {
  search = new FormControl<string | null>(null);
  isCompleted = new FormControl<boolean | null>(null);

  search$ = formControlChanges(this.search);
  isCompleted$ = formControlChanges(this.isCompleted);

  date = new BehaviorSubject<string>(localISODate());
  opacity = new BehaviorSubject<number>(0.25);

  loading = new BehaviorSubject<boolean>(true);

  chargeCodeToColor = chargeCodeToColor;

  summary$: Observable<GetPointsSummaryResponseV1>;

  constructor(public hqService: HQService) {
    this.summary$ = combineLatest({
      date: this.date,
      search: this.search$,
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
  configureChargeCodeColorOpacity(point: GetPointsSummaryPlanningPoint) {
    const chargeCodeId = point.chargeCodeId;
    const defaultOpacity = 0.25;
    const searchValue = this.search.value?.toLowerCase();

    if (!searchValue?.trim().length) {
      return chargeCodeToColor(chargeCodeId, defaultOpacity);
    }

    if (
      searchValue.includes(point.clientName?.toLowerCase() || '') ||
      searchValue.includes(point.projectName?.toLowerCase() || '') ||
      searchValue.includes(point.chargeCode?.toLowerCase() || '')
    ) {
      return chargeCodeToColor(chargeCodeId, defaultOpacity);
    }

    return chargeCodeToColor(chargeCodeId, 0.1);
  }
}
