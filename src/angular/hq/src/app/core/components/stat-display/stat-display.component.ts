import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-stat-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-display.component.html',
})
export class StatDisplayComponent {
  @Input() title?: string;
  @Input() value?: number | null;
  @Input() fallback: string = '-';
  @Input() large: boolean = false;

  get displayValue(): string | undefined {
    return this.value !== null ? this.value?.toFixed(2) : '-';
  }
}
