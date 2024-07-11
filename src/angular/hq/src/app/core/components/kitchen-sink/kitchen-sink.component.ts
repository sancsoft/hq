import { Component } from '@angular/core';
import { SearchInputComponent } from '../search-input/search-input.component';
import { FormLabelComponent } from '../form-label/form-label.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { TextInputComponent } from '../text-input/text-input.component';
import { ButtonComponent } from '../button/button.component';
import { DateInputComponent } from '../date-input/date-input.component';
import { SelectInputComponent } from '../select-input/select-input.component';
import { StatLabelComponent } from '../stat-label/stat-label.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { TextareaInputComponent } from '../textarea-input/textarea-input.component';
import { localISODate } from '../../../common/functions/local-iso-date';

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
    DateInputComponent,
    SelectInputComponent,
    StatLabelComponent,
    ProgressBarComponent,
    TextareaInputComponent,
  ],
  templateUrl: './kitchen-sink.component.html',
})
export class KitchenSinkComponent {
  public form = new FormGroup({
    select: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    textarea: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    checkbox: new FormControl<boolean>(false),
    radio: new FormControl<string | null>('option1'),
    date: new FormControl<string | null>(localISODate(), {
      validators: [Validators.required],
    }),
    search: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    text: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });
  public date = new FormControl<string | null>(localISODate(), {
    validators: [Validators.required],
  });
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
  clicked() {
    console.log('Button clicked');
  }
}
