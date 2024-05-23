import { HQSnackBarService } from './../../common/hq-snack-bar/services/hq-snack-bar-service';
import { PsrDetailsHeaderComponent } from './../psr-details-header/psr-details-header.component';
import { Component, HostListener, ViewChild } from '@angular/core';
import { SortDirection } from '../../models/common/sort-direction';
import {
  GetPSRTimeRecordV1,
  SortColumn,
} from '../../models/PSR/get-psr-time-v1';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  firstValueFrom,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { HQService } from '../../services/hq.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeStatus } from '../../models/common/time-status';
import { PsrService } from '../psr-service';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { PsrDetailsSearchFilterComponent } from '../psr-details-search-filter/psr-details-search-filter.component';

@Component({
  selector: 'hq-psrdetails',
  standalone: true,
  imports: [
    CommonModule,
    PsrDetailsHeaderComponent,
    SortIconComponent,
    PsrDetailsSearchFilterComponent,
  ],
  templateUrl: './psrdetails.component.html',
})
export class PSRDetailsComponent {
  apiErrors: string[] = [];

  refresh$ = new Subject<void>();

  psrId$: Observable<string>;
  time$: Observable<GetPSRTimeRecordV1[]>;
  timeIds$: Observable<string[]>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  selectedTimes$ = new BehaviorSubject<string[]>([]);
  lastSelectedTime$ = new BehaviorSubject<string | null>(null);
  shiftKey$ = new BehaviorSubject<boolean>(false);

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  timeStatus = TimeStatus;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private psrService: PsrService,
    private hqSnackBarService: HQSnackBarService,
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    const search$ = psrService.search.valueChanges.pipe(
      startWith(psrService.search.value)
    );

    const psrId$ = this.route.params.pipe(map((params) => params['psrId']));
    this.psrId$ = psrId$;

    const request$ = combineLatest({
      search: search$,
      projectStatusReportId: psrId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const apiResponse$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRTimeV1(request))
    );

    const refresh$ = this.refresh$.pipe(
      switchMap(() => apiResponse$),
      tap(t => this.deselectAll())
    );

    const response$ = merge(apiResponse$, refresh$).pipe(shareReplay(1));

    this.time$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );
    console.log(1);
    this.time$.subscribe((t) => console.log(t));
    this.timeIds$ = this.time$.pipe(
      map((response) => {
        return response.map((t) => t.id);
      })
    );
    psrService.hideProjectStatus();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftKey$.next(event.shiftKey);
    }
  }
  @HostListener('window:keyup', ['$event'])
  onKeyup(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftKey$.next(event.shiftKey);
    }
  }
  @HostListener('window:blur', ['$event'])
  onBlur(event: KeyboardEvent) {
    this.shiftKey$.next(false);
  }

  isSelected(timeId: string) {
    return this.selectedTimes$.pipe(
      map((selected) => selected.includes(timeId))
    );
  }

  deselectAll() {
    this.selectedTimes$.next([]);
    this.lastSelectedTime$.next(null);
  }

  async toggleTime(timeId: string) {
    let selected = [...(await firstValueFrom(this.selectedTimes$))];
    let shift = await firstValueFrom(this.shiftKey$);

    if (selected.includes(timeId)) {
      selected.splice(selected.indexOf(timeId), 1);
    } else {
      selected.push(timeId);
    }

    if (shift) {
      let startRowTimeIndex = 0;
      let endRowTimeIndex = 0;
      let timeIds = await firstValueFrom(this.timeIds$);
      let indexForShiftTime = timeIds.indexOf(timeId);
      let indexesOfSelectedTimes = selected.map((t) => timeIds.indexOf(t));
      startRowTimeIndex = Math.min(
        Math.min(...indexesOfSelectedTimes),
        indexForShiftTime
      );
      endRowTimeIndex = Math.max(
        Math.max(...indexesOfSelectedTimes),
        indexForShiftTime
      );

      this.deselectAll();
      selected = timeIds.slice(startRowTimeIndex, endRowTimeIndex + 1);
      const pendingTimes = await firstValueFrom(
        this.time$.pipe(
          map((t) =>
            t.filter((t) => t.status == TimeStatus.Pending).map((t) => t.id)
          )
        )
      );
      selected = selected.filter((t) => pendingTimes.includes(t));
    }

    this.selectedTimes$.next(selected);
    this.lastSelectedTime$.next(timeId);
  }

  async accept(timeIds: string[]) {
    const psrId = await firstValueFrom(this.psrId$);

    if (timeIds.length == 0) {
      return;
    }

    const response = await firstValueFrom(
      this.hqService.approvePSRTimeV1({
        projectStatusReportId: psrId,
        timeIds: timeIds,
      })
    );

    this.refresh$.next();
  }

  async acceptSelected() {
    const selected = await firstValueFrom(this.selectedTimes$);
    await this.accept(selected);
  }

  async acceptAll() {
    const allTime = await firstValueFrom(
      this.time$.pipe(map((t) => t.map((x) => x.id)))
    );
    await this.accept(allTime);
  }

  async acceptTime(timeId: string) {
    await this.accept([timeId]);
  }

  async updateDescription(timeId: string, event: Event) {
    const description = (event.target as HTMLInputElement).value;
    const psrId = await firstValueFrom(this.psrId$);
    const time = await firstValueFrom(
      this.time$.pipe(map((times) => times.find((x) => x.id == timeId)))
    );

    if (!time || description.length < 1) {
      alert('Please Enter a description');
      // TODO: Alert the users
      return;
    }

    const request = {
      projectStatusReportId: psrId,
      timeId: timeId,
      billableHours: time.billableHours,
      activity: time.activity,
      notes: description,
    };

    // TOOD: Call API
    const response = firstValueFrom(this.hqService.updatePSRTimeV1(request));
    this.hqSnackBarService.showMessage("Test Title", "Test Description...")
    this.refresh$.next();

    console.log('Call update API', request);
  }

  async updateBillableHours(timeId: string, event: Event) {
    const billableHours = (event.target as HTMLInputElement).value;
    const roundedBillableHours = this.roundToNextQuarter(billableHours);
    console.log(roundedBillableHours);
    const psrId = await firstValueFrom(this.psrId$);
    const time = await firstValueFrom(
      this.time$.pipe(map((times) => times.find((x) => x.id == timeId)))
    );
    // if (time) {
    //   time.billableHours = roundedBillableHours;
    // }

    if (!time || billableHours == '0' || billableHours == '') {
      alert('Please Add a time to your billable hours');
      return;
    }

    const request = {
      projectStatusReportId: psrId,
      timeId: timeId,
      billableHours: roundedBillableHours,
      activity: time.activity,
      notes: time.description,
    };
    //  Call API
    const response = firstValueFrom(this.hqService.updatePSRTimeV1(request))
    this.refresh$.next();

    console.log('Call update API', request);
  }

  // Reject
  async reject(timeId: string) {
    const psrId = await firstValueFrom(this.psrId$);
    console.log(timeId);

    if (timeId === '') {
      return;
    }

    const response = await firstValueFrom(
      this.hqService.rejectPSRTimeV1({
        projectStatusReportId: psrId,
        timeId: timeId,
      })
    );
    console.log(response);

    this.refresh$.next();
    this.deselectAll();
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
  }
  roundToNextQuarter(num: string | number) {
    return Math.ceil(Number(num) * 4) / 4;
  }
}
