import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { ModalData } from '../../services/modal.service';

@Component({
  selector: 'hq-prompt-modal',
  standalone: true,
  imports: [],
  templateUrl: './prompt-modal.component.html',
})
export class PromptModalComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: ModalData,
    public dialogRef: DialogRef<string | null>,
  ) {}
}
