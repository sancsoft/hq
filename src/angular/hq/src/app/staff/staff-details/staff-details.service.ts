import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaffDetailsService {
  private staffIdSubject = new BehaviorSubject<string | null>(null);
  staffId$ = this.staffIdSubject.asObservable();

  constructor() {}
  setStaffId(staffId?: string | null) {
    if (staffId) {
      this.staffIdSubject.next(staffId);
    }
  }
}
