import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Form,
  FormControl,
  FormControlName,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'hq-date-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './date-input.component.html',
})
export class DateInputComponent {
  @Input()
  formControl: FormControl | null = null;
  @Input()
  formControlName: string | null = null;
  @Input()
  readonly: boolean = false;
  @Input()
  disabled: boolean = false;
  @Input()
  handleDateChange: boolean = false;
  @Input()
  form?: FormGroup
  @Input()
  width?: number;
  @Output()
  dateSelected = new EventEmitter<void>();

  onDateSelected(): void {
    this.dateSelected.emit();
  }
}
