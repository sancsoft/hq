import { Injectable } from '@angular/core';
import {
  GetClientRecordV1,
  GetClientResponseV1,
  SortColumn,
} from '../../models/clients/get-client-v1';
import { BaseListService } from '../../core/services/base-list.service';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { combineLatest, debounceTime, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientListService extends BaseListService<
  GetClientResponseV1,
  GetClientRecordV1,
  SortColumn
> {
  protected override getResponse(): Observable<GetClientResponseV1> {
    return combineLatest({
      search: this.search$,
      skip: this.skip$,
      take: this.itemsPerPage$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    }).pipe(
      debounceTime(500),
      tap(() => this.loadingSubject.next(true)),
      switchMap((request) => this.hqService.getClientsV1(request)),
      tap(() => this.loadingSubject.next(false)),
    );
  }

  constructor(private hqService: HQService) {
    super(SortColumn.Name, SortDirection.Asc);
  }
}
