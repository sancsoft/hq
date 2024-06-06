import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() { }

  confirm(title: string, message: string = ''): Observable<boolean> {
    return of(window.confirm(`${title}\n${message}`));
  }

  alert(title: string, message: string): Observable<void> {
    var onClose$ = new Subject<void>();
    window.alert(`${title}\n${message}`)
    onClose$.complete();
    return onClose$;
  }

  prompt(title: string, message: string = ''): Observable<string|null> {
    return of(window.prompt(`${title}\n${message}`));
  }

  // showCustom(title: string, component: ComponentType<C>, data: ?): Observable<?> {
    
  // }

}
