import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'hq-error-display',
  standalone: true,
  imports: [],
  templateUrl: './error-display.component.html',
})
export class ErrorDisplayComponent {
  @Input('errors') apiErrors: string[] = [];
}
