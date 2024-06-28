import { Component } from '@angular/core';
import { StaffDashboardService } from './service/staff-dashboard.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Period } from '../models/times/get-time-v1';
import {
  HQTimeChangeEvent,
  HQTimeDeleteEvent,
  StaffDashboardTimeEntryComponent,
} from './staff-dashboard-time-entry/staff-dashboard-time-entry.component';
import { updateTimeRequestV1 } from '../models/times/update-time-v1';
import { firstValueFrom, map } from 'rxjs';
import { HQService } from '../services/hq.service';
import { APIError } from '../errors/apierror';
import { ToastService } from '../services/toast.service';
import { ModalService } from '../services/modal.service';
import { StaffDashboardSearchFilterComponent } from './staff-dashboard-search-filter/staff-dashboard-search-filter.component';
import { StaffDashboardDateRangeComponent } from './staff-dashboard-date-range/staff-dashboard-date-range.component';
import { TimeStatus } from '../models/common/time-status';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'hq-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StaffDashboardTimeEntryComponent,
    StaffDashboardSearchFilterComponent,
    StaffDashboardDateRangeComponent,
  ],
  providers: [StaffDashboardService],
  templateUrl: './staff-dashboard.component.html',
})
export class StaffDashboardComponent {
  constructor(
    public staffDashboardService: StaffDashboardService,
    private hqService: HQService,
    private toastService: ToastService,
    private modalService: ModalService,
    private oidcSecurityService: OidcSecurityService,
  ) {}

  Period = Period;
  timeStatus = TimeStatus;

  async deleteTime(event: HQTimeDeleteEvent) {
    const request = {
      id: event.id,
    };

    const confirm = await firstValueFrom(
      this.modalService.confirm(
        'Delete',
        'Are you sure you want to delete this time entry?',
      ),
    );

    if (!confirm) {
      return;
    }

    try {
      await firstValueFrom(this.hqService.deleteTimeV1(request));
      this.toastService.show('Success', 'Time entry successfully deleted.');
      this.staffDashboardService.refresh();
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }

  async upsertTime(event: HQTimeChangeEvent) {
    if (!event.date) {
      return;
    }

    const request: Partial<updateTimeRequestV1> = {
      id: event.id,
      hours: event.hours,
      chargeCodeId: event.chargeCodeId,
      task: event.task,
      activityId: event.activityId,
      notes: event.notes,
      date: event.date,
    };

    try {
      await firstValueFrom(this.hqService.upsertTimeV1(request));
      if (event.id) {
        this.toastService.show('Success', 'Time entry successfully updated.');
        this.staffDashboardService.refresh();
      } else {
        this.toastService.show('Success', 'Time entry successfully created.');
        this.staffDashboardService.refresh();
      }
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }
  handleRejectedTimes() {
    this.staffDashboardService.showAllRejectedTimes$.getValue()
      ? this.hideAllRejectedTimes()
      : this.showAllRejectedTimes();
  }
  private showAllRejectedTimes() {
    this.staffDashboardService.showAllRejectedTimes$.next(true);
    this.staffDashboardService.timeStatus.setValue(TimeStatus.Rejected);
  }
  private hideAllRejectedTimes() {
    this.staffDashboardService.showAllRejectedTimes$.next(false);
    this.staffDashboardService.timeStatus.reset();
  }
  async submitTimes() {
    const confirm = await firstValueFrom(
      this.modalService.confirm(
        'Submit',
        'Are you sure you want to submit time entries? Once submitted time entries cannot be modified.',
      ),
    );

    if (!confirm) {
      return;
    }
    try {
      const timesIds = await firstValueFrom(
        this.staffDashboardService.time$.pipe(
          map((t) => t.dates.flatMap((d) => d.times.map((time) => time.id))),
        ),
      );
      const staffId = await firstValueFrom(
        this.oidcSecurityService.userData$.pipe(
          map((t) => t.userData?.staff_id),
        ),
      );
      if (staffId) {
        const submitTimesRequest = { ids: timesIds, staffId: staffId };
        await firstValueFrom(this.hqService.submitTimesV1(submitTimesRequest));
        this.toastService.show(
          'Success',
          'Time entries successfully submitted.',
        );
        this.staffDashboardService.showAllRejectedTimes$.next(false);
        this.staffDashboardService.timeStatus.reset();
        this.staffDashboardService.refresh();
      } else {
        console.log('ERROR: Could not find staff');
      }
    } catch (err) {
      if (err instanceof APIError) {
        this.toastService.show('Error', err.errors.join('\n'));
      } else {
        this.toastService.show('Error', 'An unexpected error has occurred.');
      }
    }
  }
}
