import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  ElementRef,
  Input,
  Optional,
  QueryList,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { FormLabelComponent } from '../form-label/form-label.component';
import { generateUniqueInputId } from '../../functions/generate-unique-input-id';

@Component({
  selector: 'hq-search-input',
  standalone: true,
  imports: [FormsModule, CommonModule, FormLabelComponent],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements ControlValueAccessor {
  @ViewChild('input')
  input?: ElementRef<HTMLInputElement>;

  @Input()
  placeholder: string = 'Search';

  @Input()
  label: string | null = null;

  @Input()
  variant: 'primary' | 'secondary' = 'primary';

  @Input()
  public disabled = false;

  @ContentChildren(ValidationErrorDirective)
  validationErrors!: QueryList<ValidationErrorDirective>;

  protected focused = false;
  protected uniqueId = generateUniqueInputId();

  private _value: string | null = null;

  set value(value: string | null) {
    this._value = value;
    this.onChange(value);
  }

  get value(): string | null {
    return this._value;
  }

  onChange: (value: string | null) => void = () => {};
  onTouched: (value: string | null) => void = () => {};

  constructor(@Self() @Optional() public ngControl: NgControl | null) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  writeValue(value: string): void {
    this._value = value;
  }

  registerOnChange(onChange: (value: string | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: (value: string | null) => void) {
    this.onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFocus() {
    this.focused = true;
  }

  onBlur() {
    this.focused = false;
    if (this.input?.nativeElement) {
      this.onTouched(this.input.nativeElement.value);
    }
  }

  focus() {
    this.input?.nativeElement?.focus();
    this.input?.nativeElement?.select();
  }
}
