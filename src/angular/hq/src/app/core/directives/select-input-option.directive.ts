import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[hqSelectInputOption]',
  standalone: true,
})
export class SelectInputOptionDirective<T> {
  @Input('hqSelectInputOption')
  value?: T | string | null | undefined;

  @Input('hqSelectInputOptionSearch')
  search?: string;

  @Input('hqSelectInputOptionSelectedDisplay')
  selectedDisplay?: string;

  constructor(public templateRef: TemplateRef<unknown>) {}
}
