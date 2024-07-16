import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../../errors/error-display/error-display.component';
import { RouterLink } from '@angular/router';
import { ClientDetailsService } from '../client-details.service';
@Component({
  selector: 'hq-client-details-summary',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent, RouterLink],
  templateUrl: './client-details-summary.component.html',
})
export class ClientDetailsSummaryComponent {
  constructor(public clientDetailsService: ClientDetailsService) {}
}
