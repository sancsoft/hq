import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { ToastService } from '../../services/toast.service';
import { Jurisdiciton } from '../../enums/jurisdiciton';

interface Form {
  name: FormControl<string | null>;
  jurisdiciton: FormControl<Jurisdiciton | null>;
  date: FormControl<Date | null>;
}

@Component({
  selector: 'hq-holiday-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    RouterLink,
  ],
  templateUrl: './holiday-edit.component.html',
})
export class HolidayEditComponent implements OnInit {
  holidayId?: string;
  apiErrors: string[] = [];
  showHoliday$ = new BehaviorSubject<boolean | null>(null);
  Jurisdiction = Jurisdiciton;

  form = new FormGroup<Form>({
    name: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    jurisdiciton: new FormControl(Jurisdiciton.USA, {
      validators: [],
    }),
    date: new FormControl(null, {
      validators: [],
    }),
  });
  async ngOnInit() {
    this.holidayId =
      (await (
        await firstValueFrom(this.route.paramMap.pipe())
      ).get('holidayId')) ?? undefined;
    await this.getHoliday();
  }

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {}

  private async getHoliday() {
    try {
      const request = { id: this.holidayId };
      const response = await firstValueFrom(
        this.hqService.getHolidayV1(request),
      );
      const holiday = response.records[0];
      this.form.setValue({
        name: holiday.name,
        jurisdiciton: holiday.jurisdiciton ?? null,
        date: holiday.date ?? null,
      });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error'];
      return;
    }
    this.apiErrors = [];
    console.log('Form is valid');

    try {
      const request = { id: this.holidayId, ...this.form.value };
      await firstValueFrom(this.hqService.upsertHolidayV1(request));
      await this.router.navigate(['../../'], { relativeTo: this.route });
      this.toastService.show('Updated', 'Holiday has been updated');
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
