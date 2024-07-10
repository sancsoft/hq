import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-stat-label',
  standalone: true,
  imports: [],
  templateUrl: './stat-label.component.html',
})
export class StatLabelComponent {
  @Input()
  align: 'left' | 'center' | 'right' = 'left';

  @Input()
  size: 'regular' | 'large' = 'regular';
}
