import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'hq-dual-panel',
  standalone: true,
  imports: [CommonModule],
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
