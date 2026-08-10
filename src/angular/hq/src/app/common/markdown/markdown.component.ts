import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'hq-markdown',
  imports: [MarkdownModule],
  templateUrl: './markdown.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.Emulated,
})
export class HQMarkdownComponent {
  @Input() data: string | null = null;
}
