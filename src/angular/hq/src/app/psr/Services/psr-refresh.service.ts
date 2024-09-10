import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PsrRefreshService {
  private refreshSubject = new BehaviorSubject<boolean>(false);

  triggerRefresh() {
    this.refreshSubject.next(true);
  }

  getRefreshObservable() {
    return this.refreshSubject.asObservable();
  }
}
