import { Component, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { BaseListService } from '../../services/base-list.service';
import { PagedResponseV1 } from '../../../models/common/paged-response-v1';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'tbody[hq-table-body]',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './table-body.component.html',
})
export class TableBodyComponent<
  TResponse extends PagedResponseV1<TRecord>,
  TRecord,
  TSort,
> {
  constructor(
    private elRef: ElementRef<HTMLTableSectionElement>,
    public table: TableComponent<TResponse, TRecord, TSort>,
    public listService: BaseListService<TResponse, TRecord, TSort>,
  ) {}
}
