import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AngularSplitModule, ISplitDirection } from 'angular-split';

export enum PanelDirection {
  Horizontal,
  Vertical,
}
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
  // TODO: make this configurable for collapse direction
  private collapsed = false;
  private originalCSizes: number[] = [];
  ngOnInit(): void {
    this.originalCSizes = [...this.CSizes];
  }
  // This method is configured for two splitted views
  collapseCArea() {
    if (this.collapsed) {
      this.CSizes = [...this.originalCSizes];
      this.collapsed = false;
    } else {
      this.CSizes = [99, 1];
      this.collapsed = true;
    }
  }
}
