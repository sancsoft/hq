import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { SortIconComponent } from '../../../common/sort-icon/sort-icon.component';
import { InRolePipe } from '../../../pipes/in-role.pipe';
import { ButtonComponent } from '../../../core/components/button/button.component';
import { ClientQuoteListService } from './client-quote-list.service';
import { HQRole } from '../../../enums/hqrole';
import { CoreModule } from '../../../core/core.module';
import { firstValueFrom } from 'rxjs';
import { HQService } from '../../../services/hq.service';
import { BaseListService } from '../../../core/services/base-list.service';
import { ClientDetailsService } from '../client-details.service';
import FileSaver from 'file-saver';
@Component({
  selector: 'hq-client-quote-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    InRolePipe,
    ButtonComponent,
    CoreModule,
  ],
  providers: [
    {
      provide: BaseListService,
      useExisting: ClientQuoteListService,
    },
  ],
  templateUrl: './client-quote-list.component.html',
})
export class ClientQuoteListComponent {
  HQRole = HQRole;

  constructor(
    private route: ActivatedRoute,
    public listService: ClientQuoteListService,
    private hqService: HQService,
    public clientDetailsService: ClientDetailsService,
  ) {
    this.clientDetailsService.resetFilters();
    this.clientDetailsService.showProjectStatus();
    listService.refresh();
  }

  async getPdf(id: string) {
    const result = await firstValueFrom(this.hqService.getQuotePDFV1({ id }));
    if (result.file === null) {
      return;
    }

    FileSaver.saveAs(result.file, result.fileName);
  }
}
