import { SortIconComponent } from './../../../common/sort-icon/sort-icon.component';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SortColumn } from '../../../models/projects/get-project-v1';
import { HQService } from '../../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { SortDirection } from '../../../models/common/sort-direction';
import { InRolePipe } from '../../../pipes/in-role.pipe';
import { HQRole } from '../../../enums/hqrole';
import { ClientDetailsService } from '../client-details.service';
import { ButtonComponent } from '../../../core/components/button/button.component';
import { ClientProjectListService } from './client-project-list.service';
import { CoreModule } from '../../../core/core.module';
import { BaseListService } from '../../../core/services/base-list.service';

@Component({
  selector: 'hq-client-project-list',
  standalone: true,
  imports: [
    RouterModule,
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
      useExisting: ClientProjectListService,
    },
  ],
  templateUrl: './client-project-list.component.html',
})
export class ClientProjectListComponent {
  sortColumn = SortColumn;
  sortDirection = SortDirection;
  HQRole = HQRole;
  Math = Math;

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    public clientDetailsService: ClientDetailsService,
    public listService: ClientProjectListService,
  ) {
    this.clientDetailsService.resetFilters();
    this.clientDetailsService.showProjectStatus();
    this.listService.refresh();
  }
}
