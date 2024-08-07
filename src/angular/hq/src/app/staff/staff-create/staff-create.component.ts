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
import { Jurisdiciton } from '../../enums/jurisdiciton';

interface Form {
  name: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  email: FormControl<string | null>;

  workHours: FormControl<number | null>;
  vacationHours: FormControl<number | null>;
  jurisdiciton: FormControl<Jurisdiciton | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  createUser: FormControl<boolean | null>;
}

@Component({
  selector: 'hq-staff-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    RouterLink,
  ],

  templateUrl: './staff-create.component.html',
})
export class StaffCreateComponent {
  apiErrors: string[] = [];
  showStaffMembers$ = new BehaviorSubject<boolean | null>(null);
  Jurisdiction = Jurisdiciton;

  form = new FormGroup<Form>({
    name: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    firstName: new FormControl(null, {
      validators: [Validators.minLength(1)],
    }),
    lastName: new FormControl(null, {
      validators: [Validators.minLength(1)],
    }),
    email: new FormControl(null, {
      validators: [Validators.email, Validators.required],
    }),
    workHours: new FormControl(0, {
      validators: [Validators.min(0)],
    }),
    vacationHours: new FormControl(0, {
      validators: [Validators.min(0)],
    }),
    jurisdiciton: new FormControl(Jurisdiciton.USA, {
      validators: [],
    }),
    startDate: new FormControl(null, {
      validators: [],
    }),
    endDate: new FormControl(null, {}),
    createUser: new FormControl(false, {}),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
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
      await firstValueFrom(this.hqService.upsertStaffV1(request));
      await this.router.navigate(['../'], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
