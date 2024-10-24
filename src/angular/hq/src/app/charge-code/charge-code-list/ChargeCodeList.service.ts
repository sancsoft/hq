import {
  GetChargeCodesResponseV1,
  SortColumn,
  GetChargeCodeRecordV1,
} from './../../models/charge-codes/get-chargecodes-v1';
import { Injectable } from '@angular/core';
import { combineLatest, debounceTime, Observable, switchMap, tap } from 'rxjs';
import { BaseListService } from '../../core/services/base-list.service';
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
