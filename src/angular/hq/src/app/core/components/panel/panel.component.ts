import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AngularSplitModule, ISplitDirection } from 'angular-split';

export enum PanelDirection {
  Horizontal,
  Vertical,
}
export type CollapseItem = 'first' | 'second';

@Component({
  selector: 'hq-panel',
  standalone: true,
  imports: [AngularSplitModule, CommonModule],
  templateUrl: './panel.component.html',
})
export class PanelComponent implements OnInit {
  @Input()
  Direction: ISplitDirection = 'horizontal';
  @Input()
  CSizes: number[] = [50, 50];
  @Input()
  CollapseItem: CollapseItem = 'second';
  @Input()
  GutterVariant: 'primary' | 'secondary' = 'primary';

  // TODO: make this configurable for collapse direction
  private collapsed = false;
  private originalCSizes: number[] = [];
  ngOnInit(): void {
    this.collapsed = this.CSizes.includes(100);
    this.originalCSizes = [...this.CSizes];
  }
  // This method is configured for two splitted views
  collapseCArea() {
    if (this.collapsed) {
      if (this.originalCSizes.includes(100)) {
        // it means it is initialized with full width
        this.CSizes = [50, 50];
      } else {
        this.CSizes = [...this.originalCSizes];
      }

      this.collapsed = false;
    } else {
      this.CSizes = this.CollapseItem == 'second' ? [100, 0] : [0, 100];
      this.collapsed = true;
    }
  }
}
