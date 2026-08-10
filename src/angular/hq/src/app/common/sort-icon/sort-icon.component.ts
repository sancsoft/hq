import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SortDirection } from '../../models/common/sort-direction';

@Component({
  selector: 'hq-sort-icon',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './sort-icon.component.html',
})
export class SortIconComponent<TSort> {
  @Input()
  activeColumn?: TSort | null;

  @Input()
  activeSortDirection?: SortDirection | null;

  @Input()
  column?: TSort | null;

  SortDirection = SortDirection;
}
