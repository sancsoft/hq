import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-textarea-input',
  standalone: true,
  imports: [],
  templateUrl: './textarea-input.component.html',
})
export class TextareaInputComponent {
  @Input()
  placeholder: string = 'Optional Notes';
  @Input() minHeight: number = 255;
}
