import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'hq-dual-panel',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './dual-panel.component.html',
})
export class DualPanelComponent {
  sideBarCollapsed = false;
  @Input()
  leftWidth: string = '1fr';
  @Input()
  rightWidth: string = '1fr';
  @Input()
  collapseDirection: 'left' | 'right' = 'right';

  toggleSidebar() {
    this.sideBarCollapsed = !this.sideBarCollapsed;
  }
}
