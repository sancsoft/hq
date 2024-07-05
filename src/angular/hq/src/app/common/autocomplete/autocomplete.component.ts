import {
  AfterViewInit,
  Component,
  ContentChildren,
  Input,
  QueryList,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteOptionComponent } from '../autocomplete-option/autocomplete-option.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-autocomplete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autocomplete.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: AutocompleteComponent,
    },
  ],
})
export class AutocompleteComponent
  implements ControlValueAccessor, AfterViewInit
{
  isDisabled?: boolean;
  value: unknown;

  @Input()
  // eslint-disable-next-line @typescript-eslint/ban-types
  displayWith?: Function;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: unknown;
  onTouched: unknown;

  @Input()
  placeholder?: string;

  @ContentChildren(AutocompleteOptionComponent, { descendants: true })
  options?: QueryList<AutocompleteOptionComponent>;

  ngAfterViewInit(): void {
    console.log(this.options);
    if (this.options) {
      this.options.filter((t) => t.getText().includes('hello'));
    }
  }

  writeValue(value: unknown): void {
    this.value = value;
  }

  registerOnChange(onChange: unknown): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: unknown): void {
    this.onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
