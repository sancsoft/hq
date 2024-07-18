import { PsrDetailsHeaderComponent } from './../psr-details-header/psr-details-header.component';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PsrSearchFilterComponent } from '../psr-search-filter/psr-search-filter.component';
import { TabComponent } from '../../core/components/tab/tab.component';
import { HQRole } from '../../enums/hqrole';

export interface ChargeCodeViewModel {
  id: string;
  code: string;
}

@Component({
  selector: 'hq-psrdetails',
  standalone: true,
  imports: [
    CommonModule,
    PsrDetailsHeaderComponent,
    PsrSearchFilterComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TabComponent,
  ],
  templateUrl: './psrdetails.component.html',
})
export class PSRDetailsComponent {
  constructor() {}
  HQRole = HQRole;

}
