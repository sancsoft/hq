import { Injectable } from '@angular/core';
import { Observable, Subject, map, of } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { AlertModalComponent } from '../common/alert-modal/alert-modal.component';

export interface ModalData {
  title: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(public dialog: Dialog) { }

  confirm(title: string, message: string = ''): Observable<boolean> {
    return of(window.confirm(`${title}\n${message}`));
  }

  alert(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open<boolean, ModalData>(AlertModalComponent, {
      minWidth: '600px',
      data: {
        title,
        message
      }
    });

    return dialogRef.closed.pipe(map(t => true));
  }

  prompt(title: string, message: string = ''): Observable<string|null> {
    return of(window.prompt(`${title}\n${message}`));
  }

  // showCustom(title: string, component: ComponentType<C>, data: ?): Observable<?> {
    
  // }

}
