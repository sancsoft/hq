import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-form-label',
  standalone: true,
  imports: [],
  templateUrl: './form-label.component.html',
})
export class FormLabelComponent {
  @Input()
  for?: string;
}
