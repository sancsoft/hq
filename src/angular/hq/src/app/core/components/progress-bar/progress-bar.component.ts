import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
})
export class ProgressBarComponent {
  @Input()
  tooltip: string = '';

  @Input()
  text: string | null = '';

  @Input()
  percent: number | null | undefined = 0;

  Math = Math;
}
