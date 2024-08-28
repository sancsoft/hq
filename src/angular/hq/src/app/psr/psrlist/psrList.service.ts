import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { GetPSRTimeRecordStaffV1 } from '../../models/PSR/get-psr-time-v1';
import { HQService } from '../../services/hq.service';
import { Injectable } from '@angular/core';
import { ProjectStatus } from '../../enums/project-status';
import { Period } from '../../enums/period';
import {
  GetPSRRecordsV1,
  GetPSRRecordV1,
  SortColumn,
} from '../../models/PSR/get-PSR-v1';
import { BaseListService } from '../../core/services/base-list.service';
import { SortDirection } from '../../models/common/sort-direction';

@Injectable({
  providedIn: 'root',
})
export class PsrListService extends BaseListService<
  GetPSRRecordsV1,
  GetPSRRecordV1,
  SortColumn
> {
  staffMembers$: Observable<GetPSRTimeRecordStaffV1[]>;

  roaster = new FormControl<string | null>('');

  projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  staffMember = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(null);
  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);
  selectedPeriod = new FormControl<Period | null>(Period.LastWeek);
  Period = Period;

  ProjectStatus = ProjectStatus;

  showStartDate$ = new BehaviorSubject<boolean>(false);
  showEndDate$ = new BehaviorSubject<boolean>(false);

  constructor(private hqService: HQService) {
    super(SortColumn.ChargeCode, SortDirection.Asc);
    this.staffMembers$ = this.hqService
      .getStaffMembersV1({ isAssignedProjectManager: true })
      .pipe(
        map((response) => response.records),
        map((records) =>
          records.map((record) => ({
            id: record.id,
            name: record.name,
            totalHours: record.workHours,
          })),
        ),
      );
  }

  showStartDate() {
    this.showStartDate$.next(true);
  }
  hideStartDate() {
    this.showStartDate$.next(false);
  }
  showEndDate() {
    this.showEndDate$.next(true);
  }
  hideEndDate() {
    this.showEndDate$.next(false);
  }

  protected override getResponse(): Observable<GetPSRRecordsV1> {
    const staffMemberId$ = this.staffMember.valueChanges.pipe(
      startWith(this.staffMember.value),
    );

    const period$ = this.selectedPeriod.valueChanges.pipe(
      startWith(this.selectedPeriod.value),
      tap((date) => date || new Date()),
    );

    const isSubmitted$ = this.isSubmitted.valueChanges.pipe(
      startWith(this.isSubmitted.value),
    );
    const startDate$ = this.startDate.valueChanges.pipe(
      startWith(this.startDate.value),
      map((date) => date || null),
    );
    const endDate$ = this.endDate.valueChanges.pipe(
      startWith(this.endDate.value),
      map((date) => date || null),
    );
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      projectManagerId: staffMemberId$,
      sortDirection: this.sortDirection$,
      isSubmitted: isSubmitted$,
      startDate: startDate$ ?? null,
      endDate: endDate$ ?? null,
      period: period$ ?? null,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getPSRV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }
}
