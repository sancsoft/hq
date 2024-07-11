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
import { FormsModule, NgControl } from '@angular/forms';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { generateUniqueInputId } from '../../functions/generate-unique-input-id';

@Component({
  selector: 'hq-select-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-input.component.html',
})
export class SelectInputComponent {
  @ViewChild('select')
  select?: ElementRef<HTMLInputElement>;

  @Input()
  placeholder: string = '';

  @Input()
  label: string | null = null;

  @Input()
  variant: 'primary' | 'secondary' = 'primary';

  @Input()
  type: 'text' | 'email' | 'password' | 'number' = 'text';

  @Input()
  step: number | null = null;

  @Input()
  min: number | null = null;

  @Input()
  max: number | null = null;

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
    if (this.select?.nativeElement) {
      this.onTouched(this.select.nativeElement.value);
    }
  }
  async onEnter(target: EventTarget | null) {
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement
    ) {
      target.blur();
    }
  }
  focus() {
    this.select?.nativeElement?.focus();
    this.select?.nativeElement?.select();
  }
}
