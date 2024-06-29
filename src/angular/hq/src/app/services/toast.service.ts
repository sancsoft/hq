import { Injectable } from '@angular/core';
import {
  Subject,
  map,
  scan,
  switchMap,
  shareReplay,
  interval,
  Observable,
  startWith,
} from 'rxjs';

interface Toast {
  timestamp: number;
  title: string;
  message: string;
  timeout: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts$ = new Subject<Toast>();
  public toastsToDisplay$: Observable<Toast[]>;

  constructor() {
    const allToasts$ = this.toasts$.pipe(
      scan((acc: Toast[], value: Toast) => [...acc, value], []),
      shareReplay(1),
    );

    this.toastsToDisplay$ = interval(1000).pipe(
      switchMap(() => allToasts$),
      startWith([]),
      map((t) =>
        t.filter((t) => t.timestamp >= new Date().getTime() - t.timeout),
      ),
      shareReplay(1),
    );
  }

  show(title: string, message: string, timeout: number = 3000) {
    const timestamp = new Date().getTime();
    this.toasts$.next({ title, message, timestamp, timeout });
  }
}
