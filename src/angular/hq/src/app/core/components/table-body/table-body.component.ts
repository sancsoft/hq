import { Component, ElementRef } from '@angular/core';
import { BaseListService } from '../../services/base-list.service';
import { PagedResponseV1 } from '../../../models/common/paged-response-v1';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'tbody[hq-table-body]',
  standalone: true,
  imports: [CommonModule],
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
