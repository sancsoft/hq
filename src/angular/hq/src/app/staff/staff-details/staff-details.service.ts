import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaffDetailsService {
  private staffIdSubject = new BehaviorSubject<string | null>(null);
  staffId$: Observable<string>;
  private refreshSubject = new Subject<void>();

  constructor() {
    const staffId$ = this.staffIdSubject.asObservable().pipe(
      filter((staffId) => staffId != null),
      map((staffId) => staffId!),
    );
    const refreshStaffId$ = this.refreshSubject.pipe(switchMap(() => staffId$));
    this.staffId$ = merge(staffId$, refreshStaffId$);
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
