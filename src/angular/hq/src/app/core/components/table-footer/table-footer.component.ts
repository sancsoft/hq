import { Component, Input } from '@angular/core';
import { BaseListService } from '../../services/base-list.service';
import { CoreModule } from '../../core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { CommonModule } from '@angular/common';
import { PagedResponseV1 } from '../../../models/common/paged-response-v1';

@Component({
  selector: 'hq-table-footer',
  standalone: true,
  imports: [
    CoreModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorComponent,
    CommonModule,
  ],
  templateUrl: './table-footer.component.html',
})
export class TableFooterComponent<
  TResponse extends PagedResponseV1<TRecord>,
  TRecord,
  TSort,
> {
  @Input()
  listService?: BaseListService<TResponse, TRecord, TSort> | null;
}
