import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hq-stat-display',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './stat-display.component.html',
})
export class StatDisplayComponent {
  @Input()
  title?: string;

  @Input()
  large: boolean = false;
}
