import { ControlValueAccessor } from '@angular/forms';
/* eslint-disable rxjs-angular/prefer-takeuntil */
// autocomplete2.component.ts
import {
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnInit,
  Optional,
  QueryList,
  Self,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  OnDestroy,
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { generateUniqueInputId } from '../../core/functions/generate-unique-input-id';
import { ValidationErrorDirective } from '../../core/directives/validation-error.directive';
import { Subject, takeUntil } from 'rxjs';

export interface IdentifiableWithName {
  id: string | number;
  name: string;
}
@Component({
  selector: 'hq-autocomplete2',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './autocomplete2.component.html',
})
export class Autocomplete2Component
  implements OnInit, ControlValueAccessor, OnDestroy
{
  @Input()
  options: IdentifiableWithName[] = [];
  @Input()
  width = 220;
  @Input()
  public disabled = false;
  private destroy = new Subject<void>();

  @ContentChildren(ValidationErrorDirective)
  validationErrors!: QueryList<ValidationErrorDirective>;

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownTemplate', { static: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropdownTemplate!: TemplateRef<any>;
  overlayRef!: OverlayRef;
  filteredOptions: IdentifiableWithName[] = [];
  control = new FormControl();

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

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    @Self() @Optional() public ngControl: NgControl | null,
  ) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.filteredOptions = this.options;
    this.control.valueChanges.pipe(takeUntil(this.destroy)).subscribe({
      next: (value) => {
        this.filterOptions(value);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  openDropdown() {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.input.nativeElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ]);

    this.overlayRef = this.overlay.create({ positionStrategy });
    this.overlayRef.attach(
      new TemplatePortal(this.dropdownTemplate, this.viewContainerRef),
    );
  }
  handleBlur() {
    setTimeout(() => this.closeDropdown(), 100);
  }

  closeDropdown() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  selectOption(option: IdentifiableWithName) {
    this.control.setValue(option.name);
    this.closeDropdown();
    this.ngControl?.control?.setValue(option);
    console.log(this.ngControl?.control);
  }

  private filterOptions(value: string) {
    if (!value) {
      this.filteredOptions = this.options;
    } else {
      const regex = new RegExp(
        value
          .split('')
          .map((char) => `.*${char}`)
          .join(''),
        'i',
      );
      this.filteredOptions = this.options.filter((option) =>
        regex.test(option.name),
      );
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
