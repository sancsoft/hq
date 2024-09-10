import { Injectable } from '@angular/core';
import {
  GetProjectRecordV1,
  GetProjectResponseV1,
  SortColumn,
} from '../../../models/projects/get-project-v1';
import { ProjectStatus } from '../../../enums/project-status';
import {
  Observable,
  tap,
  shareReplay,
  combineLatest,
  debounceTime,
  switchMap,
} from 'rxjs';
import { formControlChanges } from '../../../core/functions/form-control-changes';
import { BaseListService } from '../../../core/services/base-list.service';
import { SortDirection } from '../../../models/common/sort-direction';
import { HQService } from '../../../services/hq.service';
import { ClientDetailsService } from '../client-details.service';
import { Period } from '../../../enums/period';

@Injectable({
  providedIn: 'root',
})
export class ClientProjectListService extends BaseListService<
  GetProjectResponseV1,
  GetProjectRecordV1,
  SortColumn
> {
  // Enums
  public ProjectStatus = ProjectStatus;
  public Period = Period;
  public SortColumn = SortColumn;

  protected override getResponse(): Observable<GetProjectResponseV1> {
    const search$ = formControlChanges(this.clientDetailsService.search).pipe(
      tap(() => this.goToPage(1)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const projectStatus$ = formControlChanges(
      this.clientDetailsService.projectStatus,
    ).pipe(
      tap(() => this.goToPage(1)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const result$ = combineLatest({
      search: search$,
      clientId: this.clientDetailsService.clientId$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      projectStatus: projectStatus$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getProjectsV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );

    return result$;
  }

  constructor(
    private hqService: HQService,
    private clientDetailsService: ClientDetailsService,
  ) {
    super(SortColumn.ChargeCode, SortDirection.Asc);
  }
}
