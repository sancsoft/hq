import { Component } from '@angular/core';
import { SearchInputComponent } from '../search-input/search-input.component';
import { FormLabelComponent } from '../form-label/form-label.component';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';

@Component({
  selector: 'hq-kitchen-sink',
  standalone: true,
  imports: [
    SearchInputComponent,
    FormLabelComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrorDirective,
  ],
  templateUrl: './kitchen-sink.component.html',
})
export class KitchenSinkComponent {
  public string = 'String value';
  public stringFormControl = new FormControl<string | null>('String value', {
    validators: [Validators.required, Validators.minLength(3)],
  });
}
