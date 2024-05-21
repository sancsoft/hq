import { Component, Input } from '@angular/core';
import { SortDirection } from '../../models/common/sort-direction';

@Component({
  selector: 'hq-sort-icon',
  standalone: true,
  imports: [],
  templateUrl: './sort-icon.component.html'
})
export class SortIconComponent {

  @Input()
  activeColumn?: number|null;

  @Input()
  activeSortDirection?: SortDirection|null;

  @Input()
  column?: number|null;

  SortDirection = SortDirection;

}
