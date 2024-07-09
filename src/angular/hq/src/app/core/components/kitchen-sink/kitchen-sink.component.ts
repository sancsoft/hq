import { Component } from '@angular/core';
import { SearchInputComponent } from '../search-input/search-input.component';
import { FormLabelComponent } from '../form-label/form-label.component';

@Component({
  selector: 'hq-kitchen-sink',
  standalone: true,
  imports: [SearchInputComponent, FormLabelComponent],
  templateUrl: './kitchen-sink.component.html',
})
export class KitchenSinkComponent {}
