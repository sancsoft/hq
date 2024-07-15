import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[hqSelectInputOption]',
  standalone: true,
})
export class SelectInputOptionDirective<T> {
  @Input('hqSelectInputOption')
  value?: T;

  constructor(public templateRef: TemplateRef<unknown>) {}
}
