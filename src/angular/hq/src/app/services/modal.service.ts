import { Injectable } from '@angular/core';
import { Observable, Subject, map, of } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { AlertModalComponent } from '../common/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from '../common/confirm-modal/confirm-modal.component';
import { PromptModalComponent } from '../common/prompt-modal/prompt-modal.component';

export interface ModalData {
  title: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(public dialog: Dialog) {}

  confirm(title: string, message: string = ''): Observable<boolean> {
    const dialogRef = this.dialog.open<boolean, ModalData>(
      ConfirmModalComponent,
      {
        minWidth: '600px',
        data: {
          title,
          message,
        },
      },
    );
    return dialogRef.closed.pipe(map((t) => t == true));
  }

  alert(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open<boolean, ModalData>(
      AlertModalComponent,
      {
        minWidth: '600px',
        data: {
          title,
          message,
        },
      },
    );

    return dialogRef.closed.pipe(map((t) => true));
  }

  prompt(title: string, message: string = ''): Observable<string | undefined> {
    const dialogRef = this.dialog.open<string, ModalData>(
      PromptModalComponent,
      {
        minWidth: '600px',
        data: {
          title,
          message,
        },
      },
    );
    return dialogRef.closed.pipe(map((t) => t));
  }

  // showCustom(title: string, component: ComponentType<C>, data: ?): Observable<?> {

  // }
}
