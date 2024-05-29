import { PsrDetailsService } from './../psr-details-service';
import { HQConfirmationModalService } from './../../common/confirmation-modal/services/hq-confirmation-modal-service';
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
  first,
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
import {
  GetChargeCodeRecordV1,
  GetChargeCodesRequestV1,
} from '../../models/charge-codes/get-chargecodes-v1';
import { FormsModule } from '@angular/forms';

export interface ChargeCodeViewModel {
  id: string;
  code: string;
}

@Component({
  selector: 'hq-psrdetails',
  standalone: true,
  imports: [
    CommonModule,
    PsrDetailsHeaderComponent,
    SortIconComponent,
    PsrDetailsSearchFilterComponent,
    FormsModule,
  ],
  templateUrl: './psrdetails.component.html',
})
export class PSRDetailsComponent {
  apiErrors: string[] = [];
  chargeCodesViewModel: ChargeCodeViewModel[] = [];

  refresh$ = new Subject<void>();

  psrId$: Observable<string>;
  time$: Observable<GetPSRTimeRecordV1[]>;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
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
    private PsrDetailsService: PsrDetailsService,
    private hqSnackBarService: HQSnackBarService,
    private hqConfirmationModalService: HQConfirmationModalService
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    const search$ = PsrDetailsService.search.valueChanges.pipe(
      startWith(PsrDetailsService.search.value)
    );

    const psrId$ = this.route.params.pipe(map((params) => params['psrId']));
    const staffMemberId$ = PsrDetailsService.staffMember.valueChanges.pipe(
      startWith(PsrDetailsService.staffMember.value)
    );

    this.psrId$ = psrId$;

    const request$ = combineLatest({
      search: search$,
      projectStatusReportId: psrId$,
      projectManagerId: staffMemberId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const apiResponse$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRTimeV1(request))
    );
    apiResponse$.pipe(
      first()
    ).subscribe((response) => {
      PsrDetailsService.staffMembers$.next(response.staff);
    });

    this.chargeCodes$ = this.hqService.getChargeCodeseV1({}).pipe(
      map((chargeCode) => chargeCode.records),
      shareReplay(1)
    );

    const refresh$ = this.refresh$.pipe(
      switchMap(() => apiResponse$),
      tap((t) => this.deselectAll())
    );

    const response$ = merge(apiResponse$, refresh$).pipe(shareReplay(1));

    this.time$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );
    this.timeIds$ = this.time$.pipe(
      map((response) => {
        return response.map((t) => t.id);
      })
    );
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
    const chargecodeId = await firstValueFrom(
      this.chargeCodes$.pipe(
        map((c) => c.find((x) => x.code == time.chargeCode)?.id)
      )
    );

    const request = {
      projectStatusReportId: psrId,
      timeId: timeId,
      billableHours: time.billableHours,
      task: time.task,
      notes: description,
      chargeCodeId: chargecodeId,
    };

    // TOOD: Call API
    const response = firstValueFrom(this.hqService.updatePSRTimeV1(request));
    this.hqSnackBarService.showMessage('Test Title', 'Test Description...');
    this.refresh$.next();
  }

  async updateTask(timeId: string, event: Event) {
    const task = (event.target as HTMLInputElement).value;
    const psrId = await firstValueFrom(this.psrId$);
    const time = await firstValueFrom(
      this.time$.pipe(map((times) => times.find((x) => x.id == timeId)))
    );

    if (!time) {
      return;
    }

    const chargecodeId = await firstValueFrom(
      this.chargeCodes$.pipe(
        map((c) => c.find((x) => x.code == time.chargeCode)?.id)
      )
    );

    const request = {
      projectStatusReportId: psrId,
      timeId: timeId,
      billableHours: time.billableHours,
      task: task,
      notes: time.description,
      chargeCodeId: chargecodeId,
    };

    // TOOD: Call API
    const response = firstValueFrom(this.hqService.updatePSRTimeV1(request));
    this.hqSnackBarService.showMessage('Test Title', 'Test Description...');
    this.refresh$.next();
  }

  async updateChargeCode(timeId: string, event: Event) {
    const chargeCode = await firstValueFrom(
      this.time$.pipe(
        map((times) => times.find((x) => x.id == timeId)?.chargeCode)
      )
    ); // this is to get the charge code of the time
    const psrId = await firstValueFrom(this.psrId$);
    const time = await firstValueFrom(
      this.time$.pipe(map((times) => times.find((x) => x.id == timeId)))
    );

    if (!time || !chargeCode || chargeCode.length != 5) {
      // this condition is to check if the charge code is valid
      alert('Please Enter a Activity Name');
      // TODO: Alert the users
      return;
    }
    this.hqConfirmationModalService.showModal(
      `Are you sure you want to change the charge code to ${chargeCode}?`
    );
    const actionTaken = await firstValueFrom(
      this.hqConfirmationModalService.cuurentAction
    );
    if (actionTaken != true) {
      this.refresh$.next();
      return;
    }
    const chargecodeId = await firstValueFrom(
      this.chargeCodes$.pipe(
        map((c) => c.find((x) => x.code == chargeCode)?.id)
      )
    );

    const request = {
      projectStatusReportId: psrId,
      timeId: timeId,
      billableHours: time.billableHours,
      task: time.task,
      notes: time.description,
      chargeCodeId: chargecodeId,
    };

    // TOOD: Call API
    const response = firstValueFrom(this.hqService.updatePSRTimeV1(request));
    this.hqSnackBarService.showMessage('Test Title', 'Test Description...');
    this.refresh$.next();
  }

  async updateBillableHours(timeId: string, event: Event) {
    const billableHours = (event.target as HTMLInputElement).value;
    const roundedBillableHours = this.roundToNextQuarter(billableHours);
    const psrId = await firstValueFrom(this.psrId$);
    const time = await firstValueFrom(
      this.time$.pipe(map((times) => times.find((x) => x.id == timeId)))
    );
    if (time) {
      time.billableHours = roundedBillableHours;
    }

    if (!time || billableHours == '0' || billableHours == '') {
      alert('Please Add a time to your billable hours');
      return;
    }
    const chargecodeId = await firstValueFrom(
      this.chargeCodes$.pipe(
        map((c) => c.find((x) => x.code == time.chargeCode)?.id)
      )
    );

    const request = {
      projectStatusReportId: psrId,
      timeId: timeId,
      billableHours: roundedBillableHours,
      task: time.task,
      notes: time.description,
      chargeCodeId: chargecodeId,
    };
    //  Call API
    const response = firstValueFrom(this.hqService.updatePSRTimeV1(request));
    this.refresh$.next();
  }

  // Reject
  async reject(timeId: string) {
    const psrId = await firstValueFrom(this.psrId$);
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
