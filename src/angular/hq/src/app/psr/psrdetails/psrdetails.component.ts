import { PsrDetailsHeaderComponent } from './../psr-details-header/psr-details-header.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
