import { Injectable } from '@angular/core';
import { BaseListService } from '../../core/services/base-list.service';
import {
  GetUsersRecordV1,
  GetUsersResponseV1,
} from '../../models/users/get-users-v1';
import { SortColumn } from '../../models/staff-members/get-staff-member-v1';
import { Observable, combineLatest, debounceTime, tap, switchMap } from 'rxjs';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { FormControl } from '@angular/forms';
import { ProjectStatus } from '../../enums/project-status';

@Injectable({
  providedIn: 'root',
})
export class UserListService extends BaseListService<
  GetUsersResponseV1,
  GetUsersRecordV1,
  SortColumn
> {
  projectStatus = new FormControl<ProjectStatus | null>(null);
  ProjectStatus = ProjectStatus;
  
  protected override getResponse(): Observable<GetUsersResponseV1> {
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getUsersV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }

  constructor(private hqService: HQService) {
    super(SortColumn.Name, SortDirection.Asc);
  }
}
