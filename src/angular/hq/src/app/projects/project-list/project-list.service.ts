import { Injectable } from '@angular/core';
import {
  GetProjectRecordV1,
  GetProjectResponseV1,
  SortColumn,
} from '../../models/projects/get-project-v1';
import { BaseListService } from '../../core/services/base-list.service';
import { ProjectStatus } from '../../enums/project-status';
import { FormControl } from '@angular/forms';
import { formControlChanges } from '../../core/functions/form-control-changes';
import {
  combineLatest,
  debounceTime,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
  startWith,
} from 'rxjs';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';
import { Period } from '../../enums/period';
import { enumToArrayObservable } from '../../core/functions/enum-to-array';

@Injectable({
  providedIn: 'root',
})
export class ProjectListService extends BaseListService<
  GetProjectResponseV1,
  GetProjectRecordV1,
  SortColumn
> {
  // Enums
  public ProjectStatus = ProjectStatus;
  public Period = Period;
  public SortColumn = SortColumn;

  // Enum lists
  public projectStatusEnum$ = enumToArrayObservable(ProjectStatus);

  // Filters
  public projectStatus = new FormControl<ProjectStatus | null>(null);
  public projectStatus$ = formControlChanges(this.projectStatus).pipe(
    tap(() => this.goToPage(1)),
    tap((status) => {
      if (status != null) {
        this.currentOnly.setValue(false);
      }
    }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  public projectManagerId = new FormControl<string | null>(null);
  public projectManagerId$ = formControlChanges(this.projectManagerId).pipe(
    tap(() => this.goToPage(1)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  projectManagers$: Observable<GetStaffV1Record[]>;
  currentOnly = new FormControl<boolean>(true);
  public currentOnly$ = formControlChanges(this.currentOnly).pipe(
    startWith(this.currentOnly.value),
    tap((value) => {
      if (value) {
        this.projectStatus.setValue(null);
      }
    }),
  );
  protected override getResponse(): Observable<GetProjectResponseV1> {
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      projectStatus: this.projectStatus$,
      sortDirection: this.sortDirection$,
      projectManagerId: this.projectManagerId$,
      currentOnly: this.currentOnly$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getProjectsV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }

  constructor(private hqService: HQService) {
    super(SortColumn.ChargeCode, SortDirection.Asc);

    this.projectManagers$ = this.hqService
      .getStaffMembersV1({
        isAssignedProjectManager: true,
      })
      .pipe(
        map((t) => t.records),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
  }
}
