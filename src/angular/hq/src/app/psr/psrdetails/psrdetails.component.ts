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
    PsrSearchFilterComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './psrdetails.component.html',
})
export class PSRDetailsComponent {
  constructor(psrService: PsrService) {}
}
