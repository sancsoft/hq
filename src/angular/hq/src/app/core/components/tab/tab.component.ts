import { Component, Input, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'hq-tab',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tab.component.html',
})
export class TabComponent {
  @Input() title?: string;
  @Input() router?: string;
}
