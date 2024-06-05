import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GetPSRRecordV1 } from '../../../models/PSR/get-PSR-v1';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HQService } from '../../../services/hq.service';

@Component({
  selector: 'hq-psr-work-week',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './psr-work-week.component.html',
})
export class PsrWorkWeekComponent {
  @Input('data') PSRWorkWeeks?: GetPSRRecordV1[] | null;

  constructor() {}
}
