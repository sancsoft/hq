import {
  GetChargeCodesResponseV1,
  SortColumn,
  GetChargeCodeRecordV1,
} from './../../models/charge-codes/get-chargecodes-v1';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { GetPSRTimeRecordStaffV1 } from '../../models/PSR/get-psr-time-v1';
import { ProjectStatus } from '../../enums/project-status';
import { BaseListService } from '../../core/services/base-list.service';
import { GetClientResponseV1 } from '../../models/clients/get-client-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';

@Injectable({
  providedIn: 'root',
})
export class ChargeCodeListService extends BaseListService<
  GetChargeCodesResponseV1,
  GetChargeCodeRecordV1,
  SortColumn
> {
  // staffMembers$ = new BehaviorSubject<GetPSRTimeRecordStaffV1[]>([]);
  // roaster = new FormControl<string | null>('');

  // projectStatus = new FormControl<ProjectStatus>(ProjectStatus.InProduction);
  // staffMember = new FormControl<string | null>(null);
  // isSubmitted = new FormControl<boolean | null>(false);

  // ProjectStatus = ProjectStatus;


  // showRoaster$ = new BehaviorSubject<boolean>(false);

  protected override getResponse(): Observable<GetChargeCodesResponseV1> {
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getChargeCodeseV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }

  constructor(private hqService: HQService) {
    super(SortColumn.ProjectName, SortDirection.Asc);
  }
}
