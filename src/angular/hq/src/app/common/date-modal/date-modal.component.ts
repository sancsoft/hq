import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { DateModalData } from '../../services/modal.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateInputComponent } from '../../core/components/date-input/date-input.component';

@Component({
  selector: 'hq-date-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './date-modal.component.html',
})
export class DateModalComponent {
  dateFormControl = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });
  constructor(
    @Inject(DIALOG_DATA) public data: DateModalData,
    public dialogRef: DialogRef<string | null>,
  ) {
    this.dateFormControl.setValue(data.date);
  }
}
