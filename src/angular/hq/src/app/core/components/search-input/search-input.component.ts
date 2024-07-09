import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'hq-search-input',
  standalone: true,
  imports: [],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent implements ControlValueAccessor {
  constructor(public ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }

  protected focused = false;
  protected disabled = false;

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

  writeValue(value: string): void {
    this.value = value;
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

  @ViewChild('input')
  input?: ElementRef<HTMLInputElement>;

  @Input()
  placeholder?: string = 'Search';

  focus() {
    this.input?.nativeElement?.focus();
  }
}
