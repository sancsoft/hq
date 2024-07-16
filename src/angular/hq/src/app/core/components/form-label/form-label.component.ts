import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-form-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-label.component.html',
})
export class FormLabelComponent {
  @Input()
  for?: string;
}
