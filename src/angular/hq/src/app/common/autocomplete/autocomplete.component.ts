import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-autocomplete',
  standalone: true,
  imports: [],
  templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent<T> {
  @Input()
  options?: T[];
}
