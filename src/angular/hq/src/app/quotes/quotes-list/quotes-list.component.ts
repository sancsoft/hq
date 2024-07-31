import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HQService } from '../../services/hq.service';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SortIconComponent } from '../../common/sort-icon/sort-icon.component';
import { ClientDetailsSearchFilterComponent } from '../../clients/client-details/client-details-search-filter/client-details-search-filter.component';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { CoreModule } from '../../core/core.module';
import saveAs from 'file-saver';
import { QuoteListService } from './quote-list.service';
import { BaseListService } from '../../core/services/base-list.service';

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
  providers: [
    {
      provide: BaseListService,
      useExisting: QuoteListService,
    },
  ],
  templateUrl: './quotes-list.component.html',
})
export class QuotesListComponent {
  HQRole = HQRole;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public listService: QuoteListService,
  ) {
    this.listService.refresh();
  }

  async getPdf(id: string) {
    const result = await firstValueFrom(this.hqService.getQuotePDFV1({ id }));
    if (result.file === null) {
      return;
    }

    saveAs(result.file, result.fileName);
  }
}
