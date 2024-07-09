import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'hq-button',
  standalone: true,
  imports: [RouterLink, CommonModule],
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
  fullWidth = false;

  @Input()
  disabled = false;

  @Input()
  target: '_self' | '_blank' = '_self';
}
