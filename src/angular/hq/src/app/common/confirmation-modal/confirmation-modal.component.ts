import { Component } from '@angular/core';
import { HQConfirmationModalService } from './services/hq-confirmation-modal-service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  message: Observable<string | null>;

  constructor(public confirmationModalService: HQConfirmationModalService) {
    this.message = confirmationModalService.currentMessage;
  }
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.confirmationModalService.saveNotes(inputElement.value);
  }
}
