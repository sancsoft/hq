import { Component } from '@angular/core';
import { HQConfirmationModalService } from './services/hq-confirmation-modal-service';

@Component({
  selector: 'hq-confirmation-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent {
  message?: string | null
  constructor(public confirmationModalService: HQConfirmationModalService) {
    confirmationModalService.currentMessage.subscribe(message => { this.message = message; });
  }

}
