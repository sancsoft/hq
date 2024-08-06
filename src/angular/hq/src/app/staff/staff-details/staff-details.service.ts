import { HQService } from './../../services/hq.service';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';

@Injectable({
  providedIn: 'root',
})
export class StaffDetailsService {
  private staffIdSubject = new BehaviorSubject<string | null>(null);
  staffId$: Observable<string>;
  staff$: Observable<GetStaffV1Record>;

  private refreshSubject = new Subject<void>();

  constructor(private hqService: HQService) {
    const staffId$ = this.staffIdSubject.asObservable().pipe(
      filter((staffId) => staffId != null),
      map((staffId) => staffId!),
    );
    const refreshStaffId$ = this.refreshSubject.pipe(switchMap(() => staffId$));
    this.staffId$ = merge(staffId$, refreshStaffId$);

    this.staff$ = this.staffId$.pipe(
      switchMap((projectId) =>
        this.hqService.getStaffMembersV1({ id: projectId }),
      ),
      map((t) => t.records[0]),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }
  setStaffId(staffId?: string | null) {
    if (staffId) {
      this.staffIdSubject.next(staffId);
    }
  }
  refresh() {
    this.refreshSubject.next();
  }
}
