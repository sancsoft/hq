import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hq-clients',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './clients.component.html',
})
export class ClientsComponent {}
