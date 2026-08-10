import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'hq-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      width: 100%;
    }
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
