import { Component } from '@angular/core';

@Component({
  selector: 'hq-autocomplete-option',
  standalone: true,
  imports: [],
  templateUrl: './autocomplete-option.component.html',
})
export class AutocompleteOptionComponent {
  getText() {
    return 'hello';
  }
}
