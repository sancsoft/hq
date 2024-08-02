import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { ToastService } from '../../services/toast.service';
import { Jurisdiciton } from '../../enums/jurisdiciton';

interface Form {
  name: FormControl<string | null>;
  jurisdiciton: FormControl<Jurisdiciton | null>;
  date: FormControl<Date | null>;
}

@Component({
  selector: 'hq-holiday-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    RouterLink,
  ],

  templateUrl: './holiday-create.component.html',
})
export class HolidayCreateComponent {
  apiErrors: string[] = [];
  showHolidayMembers$ = new BehaviorSubject<boolean | null>(null);
  Jurisdiction = Jurisdiciton;

  form = new FormGroup<Form>({
    name: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),

    jurisdiciton: new FormControl(Jurisdiciton.USA, {
      validators: [],
    }),
    date: new FormControl(null, Validators.required),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {}

  async submit() {
    this.form.markAllAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = [
        'Please correct the errors in the form before submitting.',
      ];
      return;
    }
    console.log('Form is valid');

    try {
      const request = this.form.value;
      await firstValueFrom(this.hqService.upsertHolidayV1(request));
      await this.router.navigate(['../'], { relativeTo: this.route });
      this.toastService.show('Accepted', 'Holiday has been created.');
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
