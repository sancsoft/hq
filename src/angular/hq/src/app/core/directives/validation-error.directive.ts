import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[hqValidationError]',
  standalone: true,
})
export class ValidationErrorDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}

  @Input()
  hqValidationError?: string;
}
