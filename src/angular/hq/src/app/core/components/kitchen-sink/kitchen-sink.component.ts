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
import { TextInputComponent } from '../text-input/text-input.component';
import { ButtonComponent } from '../button/button.component';

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
    TextInputComponent,
    ButtonComponent,
  ],
  templateUrl: './kitchen-sink.component.html',
})
export class KitchenSinkComponent {
  public search = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.minLength(3)],
  });

  public text = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.minLength(3)],
  });

  toggleDisabled() {
    if (this.search.disabled) {
      this.search.enable();
      this.text.enable();
    } else {
      this.search.disable();
      this.text.disable();
    }
  }
}
