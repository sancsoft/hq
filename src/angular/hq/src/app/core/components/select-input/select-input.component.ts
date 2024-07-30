import { CommonModule } from '@angular/common';
import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  Optional,
  QueryList,
  Self,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { generateUniqueInputId } from '../../functions/generate-unique-input-id';
import { SelectInputOptionDirective } from '../../directives/select-input-option.directive';
import { FormLabelComponent } from '../form-label/form-label.component';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { SearchInputComponent } from '../search-input/search-input.component';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  defer,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
} from 'rxjs';
import { chargeCodeToColor } from '../../../common/functions/charge-code-to-color';

@Component({
  selector: 'hq-select-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormLabelComponent,
    CdkConnectedOverlay,
    SearchInputComponent,
  ],
  templateUrl: './select-input.component.html',
})
export class SelectInputComponent<T>
  implements AfterViewInit, AfterContentChecked
{
  @ViewChild('select')
  select?: ElementRef<HTMLInputElement>;

  @Input()
  placeholder: string = '';

  @Input()
  label: T | string | null | undefined = null;

  @Input()
  variant: 'primary' | 'secondary' | 'pill' = 'primary';

  @Input()
  pillCode? = null;

  chargeCodeToColor = chargeCodeToColor;

  @Input()
  type: 'text' | 'email' | 'password' | 'number' = 'text';

  @Input()
  step: number | null = null;

  @Input()
  min: number | null = null;

  @Input()
  max: number | null = null;

  @Input()
  autocomplete = false;

  @Input()
  inline = false;

  @Input()
  public disabled = false;

  @ContentChildren(SelectInputOptionDirective)
  options!: QueryList<SelectInputOptionDirective<T>>;

  @ContentChildren(ValidationErrorDirective)
  validationErrors!: QueryList<ValidationErrorDirective>;

  @ViewChild(SearchInputComponent, { static: false })
  search?: SearchInputComponent;

  protected searchForm = new FormControl<string | null>(null);

  protected isOpen = false;
  protected focused = false;
  protected uniqueId = generateUniqueInputId();

  private _value = new BehaviorSubject<T | string | null | undefined>(null);

  set value(value: T | string | null | undefined) {
    this._value.next(value);
    this.onChange(value);
  }

  get value(): T | string | null | undefined {
    return this._value.value;
  }

  onAttach() {
    this.cdr.detectChanges();
    if (this.search) {
      this.search.focus();
    }
  }

  onChange: (value: T | string | null | undefined) => void = () => {};
  onTouched: (value: T | string | null | undefined) => void = () => {};

  protected options$?: Observable<SelectInputOptionDirective<T>[]>;
  protected selectedOption$?: Observable<
    SelectInputOptionDirective<T> | undefined | null
  >;

  constructor(
    @Self() @Optional() public ngControl: NgControl | null,
    private cdr: ChangeDetectorRef,
  ) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  selectOption(option: SelectInputOptionDirective<T>) {
    this.value = option.value;
    this.cdr.detectChanges();

    const selected = document.querySelector(
      'button.selected',
    ) as HTMLButtonElement;

    const parent = selected.parentNode as HTMLDivElement;
    parent.scrollTop = selected.offsetTop - parent.offsetTop;
  }

  async onSearchKeyDown(event: KeyboardEvent) {
    if (!this.options$) {
      return;
    }

    const options = await firstValueFrom(this.options$);
    const optionValues = options.map((t) => t.value);
    const value = this.value;
    const valueIndex = optionValues.indexOf(value);

    if (options.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();

        if (valueIndex == -1) {
          this.selectOption(options[0]);
        } else {
          this.selectOption(
            options[(options.length + valueIndex + 1) % options.length],
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();

        if (valueIndex == -1) {
          this.selectOption(options[0]);
        } else {
          this.selectOption(
            options[(options.length + valueIndex - 1) % options.length],
          );
        }
        break;
      case 'Enter':
      case 'Escape':
        event.preventDefault();
        this.isOpen = false;
        break;
    }
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    const options$ = concat(
      defer(() => of(this.options)),
      this.options.changes.pipe(map(() => this.options)),
    ).pipe(
      map((queryList: QueryList<SelectInputOptionDirective<T>>) =>
        queryList.toArray(),
      ),
    );

    const search$ = concat(
      defer(() => of(this.searchForm.value)),
      this.searchForm.valueChanges,
    );

    this.selectedOption$ = combineLatest([options$, this._value]).pipe(
      map(([options, value]) => options.find((t) => t.value == value)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.options$ = combineLatest([options$, search$]).pipe(
      map(([options, search]) => {
        if (search) {
          const filteredOptions = options.filter((t) =>
            (search.toLowerCase() || '')
              .split(' ')
              .every((x) => t.search?.toLowerCase()?.includes(x)),
          );

          if (filteredOptions.length > 0) {
            this.selectOption(filteredOptions[0]);
          }

          return filteredOptions;
        }

        return options;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  writeValue(value: string): void {
    this._value.next(value);
  }

  registerOnChange(onChange: (value: T | string | null | undefined) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: (value: T | string | null | undefined) => void) {
    this.onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFocus() {
    this.focused = true;
    this.isOpen = true;
    this.cdr.detectChanges();
    if (this.search) {
      this.search.focus();
    }
  }

  onBlur() {
    this.isOpen = false;
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
