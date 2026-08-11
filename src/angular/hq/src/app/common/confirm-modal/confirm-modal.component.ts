import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { ModalData } from '../../services/modal.service';

@Component({
  selector: 'hq-confirm-modal',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: ModalData,
    public dialogRef: DialogRef<boolean>,
  ) {}
}
