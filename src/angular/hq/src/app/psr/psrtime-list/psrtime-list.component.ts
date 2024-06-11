import { HQConfirmationModalService } from './../../common/confirmation-modal/services/hq-confirmation-modal-service';
import { HQSnackBarService } from './../../common/hq-snack-bar/services/hq-snack-bar-service';
import { PsrDetailsHeaderComponent } from './../psr-details-header/psr-details-header.component';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeStatus } from '../../models/common/time-status';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { PsrSearchFilterComponent } from '../psr-search-filter/psr-search-filter.component';
import {
  GetChargeCodeRecordV1,
  GetChargeCodesRequestV1,
} from '../../models/charge-codes/get-chargecodes-v1';
import { FormsModule } from '@angular/forms';
import { PsrService } from '../psr-service';
import { ButtonState } from '../../enums/ButtonState';
import { ModalService } from '../../services/modal.service';

export interface ChargeCodeViewModel {
  id: string;
  code: string;
}

@Component({
  selector: 'hq-psrtime-list',
  standalone: true,
  imports: [
    CommonModule,
    PsrDetailsHeaderComponent,
    SortIconComponent,
    PsrSearchFilterComponent,
    FormsModule,
  ],
  templateUrl: './psrtime-list.component.html',
})
export class PSRTimeListComponent implements OnInit, OnDestroy {
  apiErrors: string[] = [];
  chargeCodesViewModel: ChargeCodeViewModel[] = [];
  refresh$ = new Subject<void>();
  selectedChargeCodeId$ = new Subject<string | null>();

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

  acceptButtonState = ButtonState.Enabled;
  acceptAllButtonState = ButtonState.Enabled;
  ButtonState = ButtonState;

  ngOnInit(): void {
    this.psrService.resetFilter();
    this.psrService.showSearch();
    this.psrService.showStaffMembers();
    this.psrService.hideIsSubmitted();
    this.psrService.hideStartDate();
    this.psrService.hideEndDate();
  }
  ngOnDestroy(): void {
    this.psrService.resetFilter();
  }

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    private psrService: PsrService,
    private hqSnackBarService: HQSnackBarService,
    private hqConfirmationModalService: HQConfirmationModalService,
    private modalService: ModalService
  ) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    const search$ = psrService.search.valueChanges.pipe(
      startWith(psrService.search.value)
    );

    const psrId$ = this.route.parent!.params.pipe(
      map((params) => params['psrId'])
    );
    psrService.staffMember.reset;
    const staffMemberId$ = psrService.staffMember.valueChanges.pipe(
      startWith(psrService.staffMember.value)
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

    apiResponse$.pipe(first()).subscribe((response) => {
      psrService.staffMembers$.next(response.staff);
    });

    const psr$ = psrId$.pipe(
      switchMap((psrId) => this.hqService.getPSRV1({ id: psrId })),
      map((t) => t.records[0])
    );

    const clientId$ = psr$.pipe(map((t) => t.clientId));

    const chargeCodeRequest$ = combineLatest({
      clientId: clientId$,
    });

    const chargeCodeResponse$ = chargeCodeRequest$.pipe(
      debounceTime(500),
      switchMap((req) => this.hqService.getChargeCodeseV1(req))
    );

    this.chargeCodes$ = chargeCodeResponse$.pipe(
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
      }), tap((times) =>{
        let isPendingTime = times.find((record) =>  record.status === TimeStatus.Pending)
        if(isPendingTime) {
          this.acceptButtonState = ButtonState.Enabled;
          this.acceptAllButtonState = ButtonState.Enabled;
        } else {
          this.acceptButtonState = ButtonState.Disabled;
          this.acceptAllButtonState = ButtonState.Disabled;
        }
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
      this.time$.pipe(
        map((t) => t.filter((x) => x.status == TimeStatus.Pending)),
        map((filteredArray) => filteredArray.map((x) => x.id))
      )
    );
    await this.accept(allTime);
  }

  async acceptTime(timeId: string) {
    await this.accept([timeId]);
  }

  async unacceptTime(timeId: string) {
    const psrId = await firstValueFrom(this.psrId$);

    if (!timeId) {
      return;
    }

    const response = await firstValueFrom(
      this.hqService.unapprovePSRTimeV1({
        projectStatusReportId: psrId,
        timeId: timeId,
      })
    );

    this.refresh$.next();
  }

  async updateDescription(timeId: string, event: Event) {
    const description = (event.target as HTMLInputElement).value;
    const psrId = await firstValueFrom(this.psrId$);
    const time = await firstValueFrom(
      this.time$.pipe(map((times) => times.find((x) => x.id == timeId)))
    );

    if (!time || description.length < 1) {
      this.modalService.alert('Error', 'Please Enter a description');
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
    // this.hqSnackBarService.showMessage('Test Title', 'Test Description...');
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
    // this.hqSnackBarService.showMessage('Test Title', 'Test Description...');
    this.refresh$.next();
  }

  selectedChargeCode(selectedChargeCode: GetChargeCodeRecordV1) {
    this.selectedChargeCodeId$.next(selectedChargeCode.id);
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
      this.modalService.alert('Error', 'Please Enter a Activity Name');
      // TODO: Alert the users
      return;
    }
    // this.hqConfirmationModalService.showModal(
    //   `Are you sure you want to change the charge code to ${chargeCode}?`
    // );
    // const actionTaken = await firstValueFrom(
    //   this.hqConfirmationModalService.cuurentAction
    // );
    // if (actionTaken != true) {
    //   this.refresh$.next();
    //   return;
    // }
    const changeChargeCode = this.modalService.confirm(
      'Confirmation',
      `Are you sure you want to change the charge code to ${chargeCode}?`
    );
    if (!changeChargeCode) {
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
    // this.hqSnackBarService.showMessage('Test Title', 'Test Description...');
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
      this.modalService.alert('Error', 'Please Add a time to your billable hours');
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
    // Show modal with notes
    // this.hqConfirmationModalService.showModal(
    //   `Are you sure you want to change reject this time?`,
    //   true
    // );
    // const actionTaken = await firstValueFrom(
    //   this.hqConfirmationModalService.cuurentAction
    // );
    const notes = await firstValueFrom(this.modalService.prompt('Enter Notes'));
    console.log(notes);
    // if (actionTaken != true) {
    //   this.refresh$.next();
    //   return;
    // }
    if (notes == null) {
      this.refresh$.next();
      return;
    }

    const response = await firstValueFrom(
      this.hqService.rejectPSRTimeV1({
        projectStatusReportId: psrId,
        timeId: timeId,
        notes: notes,
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
