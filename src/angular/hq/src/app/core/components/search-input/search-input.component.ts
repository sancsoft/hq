import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'hq-search-input',
  standalone: true,
  imports: [],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {
  protected focused = false;

  @ViewChild('input')
  input?: ElementRef<HTMLInputElement>;

  @Input()
  placeholder?: string = 'Search';

  focus() {
    this.input?.nativeElement?.focus();
  }
}
