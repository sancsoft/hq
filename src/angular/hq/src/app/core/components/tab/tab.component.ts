import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'hq-tab',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './tab.component.html',
})
export class TabComponent {
  @Input()
  title?: string;
  @Input()
  routerLink?: string | unknown[] | null;
}
