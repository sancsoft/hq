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
import { FormLabelComponent } from '../form-label/form-label.component';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { generateUniqueInputId } from '../../functions/generate-unique-input-id';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-file-input',
  standalone: true,
  imports: [CommonModule, FormLabelComponent],
  templateUrl: './file-input.component.html',
})
export class FileInputComponent implements ControlValueAccessor {
  @ViewChild('input')
  input?: ElementRef<HTMLInputElement>;

  @Input()
  placeholder: string = 'No file selected.';

  @Input()
  label: string | null = null;

  @Input()
  variant: 'primary' | 'secondary' = 'primary';

  @Input()
  accept?: string | null;

  @Input()
  public disabled = false;

  @ContentChildren(ValidationErrorDirective)
  validationErrors!: QueryList<ValidationErrorDirective>;

  protected uniqueId = generateUniqueInputId();

  private _value: File | null = null;

  set value(value: File | null) {
    this._value = value;
    this.onChange(value);
  }

  get value(): File | null {
    return this._value;
  }

  onChange: (value: File | null) => void = () => {};
  onTouched: (value: File | null) => void = () => {};

  constructor(@Self() @Optional() public ngControl: NgControl | null) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  writeValue(value: File): void {
    this._value = value;
  }

  registerOnChange(onChange: (value: File | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: (value: File | null) => void) {
    this.onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event) {
    if (event.target instanceof HTMLInputElement && event.target.files) {
      if (event.target.files.length == 1) {
        this.value = event.target.files[0];
        this.onTouched(this.value);
      }
    }
  }

  clearFile() {
    this.value = null;
  }

  onCancel() {
    this.onTouched(this.value);
  }

  focus() {
    this.input?.nativeElement?.focus();
    this.input?.nativeElement?.select();
  }
}
