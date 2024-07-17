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
  ContentChild,
  Query,
  ViewChildren,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { CdkConnectedOverlay, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { generateUniqueInputId } from '../../core/functions/generate-unique-input-id';
import { ValidationErrorDirective } from '../../core/directives/validation-error.directive';
import { Subject, takeUntil } from 'rxjs';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { SearchInputComponent } from '../../core/components/search-input/search-input.component';

export interface IdentifiableWithName {
  id: string | number;
  name: string;
}
@Component({
  selector: 'hq-autocomplete2',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CdkListbox,
    CdkOption,
    SearchInputComponent,
    CdkConnectedOverlay,
  ],
  templateUrl: './autocomplete2.component.html',
})
export class Autocomplete2Component
  implements OnInit, ControlValueAccessor, OnDestroy
{
  @Input()
  options: IdentifiableWithName[] = [];

  @ViewChild(SearchInputComponent, { static: false })
  search?: SearchInputComponent;

  @Input()
  width = 220;
  @Input()
  public disabled = false;
  private destroy = new Subject<void>();
  dropdownFocus: boolean = false;
  activeOptionIndex = -1;

  @ContentChildren(ValidationErrorDirective)
  validationErrors!: QueryList<ValidationErrorDirective>;
  @ViewChildren('optionElement') optionElements!: QueryList<
    ElementRef<HTMLLIElement>
  >;
  @ViewChild('button') button!: ElementRef<HTMLButtonElement>;
  @ViewChild('dropdownTemplate', { static: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropdownTemplate!: TemplateRef<any>;
  overlayRef!: OverlayRef;
  filteredOptions: IdentifiableWithName[] = [];
  control = new FormControl();

  protected focused = false;
  protected uniqueId = generateUniqueInputId();
  protected isOpen = false;

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
    private cdr: ChangeDetectorRef,
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

  onAttach() {
    this.cdr.detectChanges();
    if (this.search) {
      this.search.focus();
    }
  }

  openDropdown() {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.button.nativeElement)
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

  closeDropdown() {
    console.log('Closing dropdown');
    if (this.overlayRef) {
      this.overlayRef.dispose();
      console.log('Closed dropdown');
    }
  }
  // This function perform select and closes the overlay
  handleSelect(option: IdentifiableWithName) {
    this.selectOption(option);
    this.isOpen = false;
  }

  selectOption(option: IdentifiableWithName) {
    this.control.setValue(option.name);
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
    this.activeOptionIndex = -1;
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
    if (this.button?.nativeElement) {
      this.onTouched(null);
    }
  }

  focus() {
    this.button?.nativeElement?.focus();
  }

  handleButtonKeydown(event: KeyboardEvent) {
    console.log('Button handler', event);
    if (event.key === 'ArrowDown') {
      this.isOpen = true;
      console.log('Arrow down button');
      this.setActiveOption(0);
    }
  }
  handleSearchInputKeydown(event: KeyboardEvent) {
    const maxIndex = this.filteredOptions.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        if (this.activeOptionIndex === null) {
          this.setActiveOption(0);
        } else {
          this.setActiveOption((this.activeOptionIndex + 1) % (maxIndex + 1));
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.activeOptionIndex === null) {
          this.setActiveOption(maxIndex);
        } else {
          this.setActiveOption(
            (this.activeOptionIndex - 1 + maxIndex + 1) % (maxIndex + 1),
          );
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (this.activeOptionIndex !== null) {
          console.log('Enter');
          if (this.activeOptionIndex >= 0) {
            this.selectOption(this.filteredOptions[this.activeOptionIndex]);
          }
          this.isOpen = false;
        }
        event.preventDefault();
        break;
      case 'Escape':
        console.log('Escape');
        this.isOpen = false;
        event.preventDefault();
        break;
    }
  }

  private setActiveOption(index: number) {
    this.activeOptionIndex = index;
    console.log(this.activeOptionIndex, 'Active option index');
    this.cdr.detectChanges();
  }
  handleBlur() {
    setTimeout(() => {
      if (!this.focused) {
        this.closeDropdown();
      }
    }, 200);
  }

  handleFocusIn(event: FocusEvent) {
    this.focused = true;
  }

  handleFocusOut(event: FocusEvent) {
    this.focused = false;
  }
}
