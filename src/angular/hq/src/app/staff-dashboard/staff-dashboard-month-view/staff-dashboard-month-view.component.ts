import { StaffDashboardService } from './../service/staff-dashboard.service';
/* eslint-disable rxjs/no-ignored-error */
/* eslint-disable rxjs-angular/prefer-async-pipe */
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { GetDashboardTimeV1Response } from '../../models/staff-dashboard/get-dashboard-time-v1';
import { TimeStatus } from '../../enums/time-status';
import {
  HQTimeChangeEvent,
  HQTimeDeleteEvent,
  StaffDashboardTimeEntryComponent,
} from '../staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import { SortColumn } from '../../models/times/get-time-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { ReplaySubject } from 'rxjs';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { localISODate } from '../../common/functions/local-iso-date';

@Component({
  selector: 'hq-staff-dashboard-month-view',
  standalone: true,
  imports: [CommonModule, StaffDashboardTimeEntryComponent, SortIconComponent],
  templateUrl: './staff-dashboard-month-view.component.html',
})
export class StaffDashboardMonthViewComponent implements OnDestroy {
  @Input() dashboard!: GetDashboardTimeV1Response;
  @Input() chargeCodes: GetChargeCodeRecordV1[] | null = [];
  @Input() showAllRejectedTimes: boolean | null = false;
  @Input() canEdit: boolean | null = false;

  timeStatus = TimeStatus;
  sortColumn = SortColumn;
  localISODate = localISODate(); // represent current day

  @Output() timeChange = new EventEmitter<HQTimeChangeEvent>();
  @Output() timeDelete = new EventEmitter<HQTimeDeleteEvent>();
  @Output() timeDuplicate = new EventEmitter<HQTimeChangeEvent>();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(public staffDashboardService: StaffDashboardService) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  upsertTime(event: HQTimeChangeEvent) {
    this.timeChange.emit(event);
  }

  deleteTime(event: HQTimeDeleteEvent) {
    this.timeDelete.emit(event);
  }

  duplicateTime(event: HQTimeChangeEvent) {
    this.timeDuplicate.emit(event);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.staffDashboardService.sortOption$.value === sortColumn) {
      this.staffDashboardService.sortDirection$.next(
        this.staffDashboardService.sortDirection$.value === SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.staffDashboardService.sortOption$.next(sortColumn);
      this.staffDashboardService.sortDirection$.next(SortDirection.Asc);
    }
  }
}
