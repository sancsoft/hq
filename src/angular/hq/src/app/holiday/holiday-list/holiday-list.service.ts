import { Observable, combineLatest, debounceTime, tap, switchMap } from 'rxjs';
import { BaseListService } from '../../core/services/base-list.service';
import { SortDirection } from '../../models/common/sort-direction';
import {
  GetHolidayV1Record,
  GetHolidayV1Response,
  SortColumn,
} from '../../models/holiday/get-holiday-v1';
import { HQService } from '../../services/hq.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HolidayListService extends BaseListService<
  GetHolidayV1Response,
  GetHolidayV1Record,
  SortColumn
> {
  protected override getResponse(): Observable<GetHolidayV1Response> {
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      upcomingOnly: this.showUpcoming$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getHolidayV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }

  constructor(private hqService: HQService) {
    super(SortColumn.Date, SortDirection.Asc);
  }
}
