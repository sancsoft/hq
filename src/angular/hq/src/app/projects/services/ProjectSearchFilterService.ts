import { Injectable, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, first, map } from 'rxjs';

import { HQService } from '../../services/hq.service';
import { ProjectStatus } from '../../clients/client-details.service';
import { GetProjectActivityRecordV1 } from '../../models/PSR/get-project-activity-v1';
import { GetPSRTimeRecordStaffV1 } from '../../models/PSR/get-psr-time-v1';

@Injectable({
  providedIn: 'root',
})
export class ProjectSearchFilterService {
  projectManagers$ = new BehaviorSubject<GetPSRTimeRecordStaffV1[]>([]);

  search = new FormControl<string | null>('');
  projectStatus = new FormControl<ProjectStatus | null>(null);
  projectManager = new FormControl<string | null>(null);
  itemsPerPage = new FormControl(20, { nonNullable: true });
  page = new FormControl<number>(1, { nonNullable: true });

  ProjectStatus = ProjectStatus;

  constructor(private hqService: HQService) {
    const staffMembersResponse$ = this.hqService
      .getStaffMembersV1({ isAssignedProjectManager: true })
      .pipe(
        map((response) => response.records),
        map((records) =>
          records.map((record) => ({
            id: record.id,
            name: record.name,
            totalHours: record.workHours,
          })),
        ),
      );

    staffMembersResponse$.pipe(first()).subscribe((response) => {
      this.projectManagers$.next(response);
    });
  }

  resetFilter() {
    this.search.setValue('');
    this.projectStatus.setValue(null);
    this.projectManager.setValue(null);
  }
}
