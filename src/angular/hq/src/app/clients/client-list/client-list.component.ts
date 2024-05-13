import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HQService } from '../../services/hq.service';
import { SortColumn } from '../../models/clients/get-client-v1';
import { SortDirection } from '../../models/common/sort-direction';

@Component({
  selector: 'hq-client-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent {

  constructor(private hqService: HQService) {
    hqService.getClientsV1({
      sortBy: SortColumn.Name,
      sortDirection: SortDirection.Asc
    }).subscribe(console.log);
  }

}
