import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { BaseListService } from '../../services/base-list.service';
import { PagedResponseV1 } from '../../../models/common/paged-response-v1';
import { SortIconComponent } from '../../../common/sort-icon/sort-icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'th[hq-sort-header]',
  standalone: true,
  imports: [SortIconComponent, CommonModule],
  templateUrl: './sort-header.component.html',
})
export class SortHeaderComponent<
  TResponse extends PagedResponseV1<TRecord>,
  TRecord,
  TSort,
> {
  @Input({ required: true, alias: 'hq-sort-header' })
  sortColumn?: TSort;

  @HostBinding('class.cursor-pointer')
  cursorPointer: boolean = true;

  @HostListener('click', ['$event']) onClick() {
    if (this.sortColumn) {
      this.listService.onSortClick(this.sortColumn);
    }
  }

  constructor(public listService: BaseListService<TResponse, TRecord, TSort>) {}
}
