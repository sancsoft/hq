/* eslint-disable rxjs-angular/prefer-takeuntil */
// autocomplete2.component.ts
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'hq-autocomplete2',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './autocomplete2.component.html',
})
export class Autocomplete2Component implements OnInit {
  @Input() options: string[] = [];
  @Input() width = 220;

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownTemplate', { static: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dropdownTemplate!: TemplateRef<any>;
  overlayRef!: OverlayRef;
  filteredOptions: string[] = [];
  control = new FormControl();

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit() {
    this.filteredOptions = this.options;
    // eslint-disable-next-line rxjs/no-ignored-error, rxjs-angular/prefer-async-pipe
    this.control.valueChanges.subscribe((value) => {
      this.filterOptions(value);
    });
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

  selectOption(option: string) {
    this.control.setValue(option);
    this.closeDropdown();
    console.log(this.control.value);
  }

  filterOptions(value: string) {
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
        regex.test(option),
      );
    }
  }
}
