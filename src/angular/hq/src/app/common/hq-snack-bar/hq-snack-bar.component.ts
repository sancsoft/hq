import { CommonModule } from '@angular/common';
import {
  HQSnackBarService,
  IHQSnackbarMessage,
} from './services/hq-snack-bar-service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'hq-hq-snack-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hq-snack-bar.component.html',
})
export class HqSnackBarComponent {
  message$: Observable<IHQSnackbarMessage | null>;
  constructor(public hqSnackbarService: HQSnackBarService) {
    this.message$ = hqSnackbarService.currentMessage;
  }
}
