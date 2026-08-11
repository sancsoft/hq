import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientDetailsService } from '../client-details.service';
import { StatDisplayComponent } from '../../../core/components/stat-display/stat-display.component';
@Component({
  selector: 'hq-client-details-summary',
  imports: [CommonModule, RouterLink, StatDisplayComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './client-details-summary.component.html',
})
export class ClientDetailsSummaryComponent {
  constructor(public clientDetailsService: ClientDetailsService) {}
}
