import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
} from '@angular/core';
import { PagedResponseV1 } from '../../../models/common/paged-response-v1';
import { BaseListService } from '../../services/base-list.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';

@Component({
  selector: 'hq-table',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, PaginatorComponent],
  templateUrl: './table.component.html',
})
export class TableComponent<
  TResponse extends PagedResponseV1<TRecord>,
  TRecord,
  TSort,
> implements AfterViewChecked
{
  public columnCount: number = 0;

  constructor(
    private elRef: ElementRef<HTMLTableElement>,
    private cdr: ChangeDetectorRef,
    public listService: BaseListService<TResponse, TRecord, TSort>,
  ) {}

  ngAfterViewChecked() {
    const table = this.elRef.nativeElement;
    const headings = table.querySelectorAll('thead th');
    if (this.columnCount != headings.length) {
      this.columnCount = headings.length;
      this.cdr.detectChanges();
    }
  }
}
