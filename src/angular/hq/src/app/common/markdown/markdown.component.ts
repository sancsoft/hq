import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'hq-markdown',
  standalone: true,
  imports: [MarkdownModule],
  styleUrl: './markdown.component.css',
  templateUrl: './markdown.component.html',
  encapsulation: ViewEncapsulation.Emulated,
})
export class HQMarkdownComponent {
  @Input() data: string = '';
}
