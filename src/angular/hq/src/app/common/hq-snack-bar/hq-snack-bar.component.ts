import { CommonModule } from '@angular/common';
import {
  HQSnackBarService,
  IHQSnackbarMessage,
} from './services/hq-snack-bar-service';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'hq-hq-snack-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hq-snack-bar.component.html',
})
export class HqSnackBarComponent {
  message?: IHQSnackbarMessage | null;
  constructor(public hqSnackbarService: HQSnackBarService) {
    hqSnackbarService.currentMessage.subscribe((message) => {
      this.message = message;
    });
  }
}
