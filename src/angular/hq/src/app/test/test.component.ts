import { Component } from '@angular/core';
import { AutocompleteComponent } from '../common/autocomplete/autocomplete.component';
import { AutocompleteOptionComponent } from '../common/autocomplete-option/autocomplete-option.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ModalService } from '../services/modal.service';
import { firstValueFrom } from 'rxjs';
import { Autocomplete2Component } from '../common/autocomplete2/autocomplete2.component';

interface TestOption {
  id: number;
  name: string;
}

@Component({
  selector: 'hq-test',
  standalone: true,
  imports: [
    AutocompleteComponent,
    AutocompleteOptionComponent,
    ReactiveFormsModule,
    Autocomplete2Component
  ],
  templateUrl: './test.component.html',
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class TestComponent {
  formControl = new FormControl<TestOption | null>(null);

  options: TestOption[] = [
    {
      id: 1,
      name: 'Option 1',
    },
    {
      id: 2,
      name: 'Option 2',
    },
    {
      id: 3,
      name: 'Option 3',
    },
  ];

  displayWith = (option: TestOption | null) => option?.name;

  constructor(private modalService: ModalService) {
    // eslint-disable-next-line rxjs-angular/prefer-async-pipe, rxjs/no-ignored-error, rxjs-angular/prefer-takeuntil
    this.formControl.valueChanges.subscribe((value) => {
      console.log('valueChanged', value);
    });
  }

  async setValue() {
    const value = await firstValueFrom(
      this.modalService.prompt(
        'Enter Value',
        'Enter a value to set the form control to',
      ),
    );
    this.formControl.setValue({ id: 999, name: value ?? '' });
  }
}
