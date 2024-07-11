import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ContentChildren,
  Optional,
  Self,
} from '@angular/core';
import {
  Form,
  FormControl,
  FormControlName,
  FormGroup,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { generateUniqueInputId } from '../../functions/generate-unique-input-id';

@Component({
  selector: 'hq-date-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './date-input.component.html',
})
export class DateInputComponent {
  @ViewChild('input')
  input?: ElementRef<HTMLInputElement>;
  @Input()
  readonly: boolean = false;
  @Input()
  disabled: boolean = false;
  @Input()
  handleDateChange: boolean = false;
  @Input()
  form?: FormGroup;
  @Input()
  width?: number;
  @Output()
  dateSelected = new EventEmitter<void>();

  @ContentChildren(ValidationErrorDirective)
  validationErrors!: QueryList<ValidationErrorDirective>;

  onDateSelected(): void {
    this.dateSelected.emit();
  }
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
