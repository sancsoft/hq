import { GetTimeRecordStaffV1 } from './../../models/times/get-time-v1';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, startWith, combineLatest, map, tap, debounceTime, switchMap, shareReplay, of, firstValueFrom } from 'rxjs';
import { GetTimeRecordV1, GetTimeRecordsV1, SortColumn } from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { TimeService } from '../services/TimeService';
import { TimeSearchFilterComponent } from '../search-filter/time-search-filter/time-search-filter.component';
import { saveAs } from "file-saver";
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'hq-time-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    TimeSearchFilterComponent,
  ],
  templateUrl: './time-list.component.html'
})
export class TimeListComponent implements OnInit {
  ngOnInit(): void {
  }
  apiErrors: string[] = [];

  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number>;
  times$: Observable<GetTimeRecordV1[]>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;



  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public timeListService: TimeService,
    private toastService: ToastService
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Desc);

    const itemsPerPage$ = this.timeListService.itemsPerPage.valueChanges.pipe(
      startWith(this.timeListService.itemsPerPage.value)
    );
    const page$ = this.timeListService.page.valueChanges.pipe(startWith(this.timeListService.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0)
    );
    const search$ = timeListService.search.valueChanges.pipe(
      tap((t) => this.goToPage(1)),
      startWith(timeListService.search.value)
    );

    this.skipDisplay$ = skip$.pipe(map((skip) => skip + 1));

    // Getting the staff members
    this.hqService.getStaffMembersV1({}).pipe(map((members) => members.records), map((records) =>
      records.map((record) => ({
        id: record.id,
        name: record.name,
      }))
    )).subscribe((staffMembers) => {
      this.timeListService.staffMembers$.next(staffMembers);
    });
    // Getting the Clients
    this.hqService.getClientsV1({}).pipe(map((clients) => clients.records), map((records) =>
      records.map((record) => ({
        id: record.id,
        name: record.name,
      }))
    )).subscribe((clients) => {
      this.timeListService.clients$.next(clients);
    });
    const clientId$ = this.timeListService.client.valueChanges.pipe(
      tap(()=>{
        this.timeListService.project.setValue(null);
      }),
      startWith(this.timeListService.client.value)
    )


// Assuming clientId$ is defined and is an observable
const projectRequest$ = combineLatest({
  clientId: clientId$
});

projectRequest$.pipe(
  switchMap(projectRequest =>
    this.hqService.getProjectsV1(projectRequest).pipe(
      map((clients) => clients.records),
      map((records) =>
        records.map((record) => ({
          id: record.id,
          name: record.name,
          chargeCode: record.chargeCode,
        }))
      )
    )
  )
).subscribe((projects) => {
  this.timeListService.projects$.next(projects);
});

  const staffMemberId$ = this.timeListService.staffMember.valueChanges.pipe(
    startWith(this.timeListService.staffMember.value)
  );

  const projectId$ = this.timeListService.project.valueChanges.pipe(
    startWith(this.timeListService.project.value)
  )
  const startDate$ = this.timeListService.startDate.valueChanges.pipe(
    startWith(this.timeListService.startDate.value)
  );
  const endDate$ = this.timeListService.endDate.valueChanges.pipe(
    startWith(this.timeListService.endDate.value)
  );
  const period$ = this.timeListService.selectedPeriod.valueChanges.pipe(
    startWith(this.timeListService.selectedPeriod.value)
  );
  const invoiced$ = this.timeListService.invoiced.valueChanges.pipe(
    startWith(this.timeListService.invoiced.value)
  );
  const accepted$ = this.timeListService.timeAccepted.valueChanges.pipe(
    startWith(this.timeListService.timeAccepted.value)
  );

    const request$ = combineLatest({
      search: search$,
      skip: skip$,
      clientId: clientId$,
      projectId: projectId$,
      staffId: staffMemberId$,
      take: itemsPerPage$,
      sortBy: this.sortOption$,
      startDate: startDate$,
      endDate: endDate$,
      period: period$,
      invoiced: invoiced$,
      TimeAccepted: accepted$,
      sortDirection: this.sortDirection$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getTimesV1(request)),
      shareReplay(1)
    );


    this.times$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );

    this.totalRecords$ = response$.pipe(map((t) => t.total!));
    this.times$.subscribe((records) => {
      console.log(records);
    });

    this.takeToDisplay$ = combineLatest([
      skip$,
      itemsPerPage$,
      this.totalRecords$,
    ]).pipe(
      map(([skip, itemsPerPage, totalRecords]) =>
        Math.min(skip + itemsPerPage, totalRecords)
      )
    );

  }

  goToPage(page: number) {
    this.timeListService.page.setValue(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.sortOption$.value == sortColumn) {
      this.sortDirection$.next(
        this.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc
      );
    } else {
      this.sortOption$.next(sortColumn);
      this.sortDirection$.next(SortDirection.Asc);
    }
    this.timeListService.page.setValue(1);
  }

  async exportTime() {
    const result = await firstValueFrom(this.hqService.exportTimesV1({  }));
    if(result.file === null)
    {
      this.toastService.show('Error', 'Unable to download export.');
      return;
    }

    console.log(result);

    saveAs(result.file, result.fileName);
  }
}
