import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HQService } from '../../services/hq.service';
import { SortColumn } from '../../models/quotes/get-quotes-v1';
import { SortDirection } from '../../models/common/sort-direction';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { ClientDetailsSearchFilterComponent } from '../../clients/client-details/client-details-search-filter/client-details-search-filter.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { ProjectStatus } from '../../enums/project-status';
import { CoreModule } from '../../core/core.module';
import saveAs from 'file-saver';
import { QuoteListService } from './quote-list.service';

@Component({
  selector: 'hq-quotes-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    ClientDetailsSearchFilterComponent,
    InRolePipe,
    CoreModule,
  ],
  templateUrl: './quotes-list.component.html',
})
export class QuotesListComponent {
  apiErrors: string[] = [];

  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public quoteListService: QuoteListService,
  ) {
    this.quoteListService.refresh();
  }

  goToPage(page: number) {
    this.quoteListService.goToPage(page);
  }

  onSortClick(sortColumn: SortColumn) {
    if (this.quoteListService.sortOption$.value == sortColumn) {
      this.quoteListService.sortDirection$.next(
        this.quoteListService.sortDirection$.value == SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
      );
    } else {
      this.quoteListService.sortOption$.next(sortColumn);
      this.quoteListService.sortDirection$.next(SortDirection.Asc);
    }
    this.goToPage(1);
  }
  getProjectStatusString(status: ProjectStatus): string {
    return ProjectStatus[status];
  }

  async getPdf(id: string) {
    const result = await firstValueFrom(this.hqService.getQuotePDFV1({ id }));
    if (result.file === null) {
      return;
    }

    saveAs(result.file, result.fileName);
  }
}
