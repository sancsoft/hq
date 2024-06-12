import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'hq-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: `:host { width: 100%; }`
})
export class ToastComponent {
  constructor(public toastService: ToastService) {
  }
}
