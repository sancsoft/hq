import { PsrDetailsHeaderComponent } from './../psr-details-header/psr-details-header.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { PsrSearchFilterComponent } from '../psr-search-filter/psr-search-filter.component';
import { TabComponent } from '../../core/components/tab/tab.component';
import { HQRole } from '../../enums/hqrole';

export interface ChargeCodeViewModel {
  id: string;
  code: string;
}

@Component({
  selector: 'hq-psrdetails',
  imports: [PsrDetailsHeaderComponent, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './psrdetails.component.html',
})
export class PSRDetailsComponent {
  constructor() {}
  HQRole = HQRole;
}
