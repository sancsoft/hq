import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hq-error-display',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './error-display.component.html',
})
export class ErrorDisplayComponent {
  @Input() errors: string[] = [];
}
