import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-stat-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-display.component.html',
})
export class StatDisplayComponent {
  @Input()
  title?: string;

  @Input()
  large: boolean = false;
}
