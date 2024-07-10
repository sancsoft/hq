import { Component, Input, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'hq-tab',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tab.component.html',
})
export class TabComponent {
  @Input()
  title?: string;
  @Input()
  routerLink?: string | unknown[] | null;
}
