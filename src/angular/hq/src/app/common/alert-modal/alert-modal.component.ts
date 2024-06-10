import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { ModalData } from '../../services/modal.service';

@Component({
  selector: 'hq-alert-modal',
  standalone: true,
  imports: [],
  templateUrl: './alert-modal.component.html'
})
export class AlertModalComponent {
  constructor(@Inject(DIALOG_DATA) public data: ModalData, public dialogRef: DialogRef<boolean>) {}
}
