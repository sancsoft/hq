import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

@Component({
  selector: 'hq-button',
  imports: [RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input()
  variant: 'primary' | 'outline' = 'primary';

  @Input()
  type: 'button' | 'submit' = 'button';

  @Input()
  routerLink?: string | unknown[] | null;

  @Input()
  queryParams?: Params;

  @Input()
  fullWidth = false;

  @Input()
  disabled = false;

  @Input()
  target: '_self' | '_blank' = '_self';
}
