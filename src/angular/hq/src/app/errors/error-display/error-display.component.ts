import { Component, Input } from '@angular/core';

@Component({
    selector: 'hq-error-display',
    imports: [],
    templateUrl: './error-display.component.html'
})
export class ErrorDisplayComponent {
  @Input() errors: string[] = [];
}
