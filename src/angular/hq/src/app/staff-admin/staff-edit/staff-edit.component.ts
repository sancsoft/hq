/* eslint-disable rxjs-angular/prefer-takeuntil */
/* eslint-disable rxjs-angular/prefer-async-pipe */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { Jurisdiciton } from '../../enums/jurisdiciton';
import { ButtonComponent } from '../../core/components/button/button.component';
import { ToastService } from '../../services/toast.service';
import { StaffDetailsService } from '../../staff/staff-details/staff-details.service';

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
}

@Component({
  selector: 'hq-staff-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    RouterLink,
    ButtonComponent,
  ],
  templateUrl: './staff-edit.component.html',
})
export class StaffEditComponent implements OnDestroy, OnInit {
  staffId?: string;
  apiErrors: string[] = [];
  showStaffMembers$ = new BehaviorSubject<boolean | null>(null);
  Jurisdiction = Jurisdiciton;
  canSubmit$ = new BehaviorSubject<boolean>(true);

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
      validators: [Validators.email],
    }),
    workHours: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    vacationHours: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    jurisdiciton: new FormControl(Jurisdiciton.USA, {
      validators: [],
    }),
    startDate: new FormControl(null, {
      validators: [Validators.required],
    }),
    endDate: new FormControl(null, {}),
  });
  async ngOnInit() {
    this.staffId =
      (await (
        await firstValueFrom(this.route.paramMap.pipe())
      ).get('staffId')) ?? undefined;
    await this.getStaff();

    this.form.controls.endDate.valueChanges
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (endDate) => {
          if (typeof endDate == 'string' && endDate == '') {
            this.form.controls.endDate.setValue(null, { emitEvent: false });
          }
        },
        error: console.error,
      });

    this.form.statusChanges.pipe(takeUntil(this.destroy)).subscribe({
      next: (status) => {
        this.canSubmit$.next(status === 'VALID');
      },
      error: console.error,
    });
  }

  private destroy = new Subject<void>();
  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private staffDetailsService: StaffDetailsService,
    private toastService: ToastService,
  ) {}

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
      const staffId = await firstValueFrom(this.staffDetailsService.staffId$);
      const request = { id: staffId, ...this.form.value };
      await firstValueFrom(this.hqService.upsertStaffV1(request));
      this.staffDetailsService.refresh();
      this.toastService.show('Success', 'Staff member updated successfully');
      await this.router.navigate(['..'], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.toastService.show(
          'Error',
          'There was an error updating the staff member.',
        );
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }

  private async getStaff() {
    try {
      const staffId = await firstValueFrom(this.staffDetailsService.staffId$);
      const request = { id: staffId };
      const response = await firstValueFrom(
        this.hqService.getStaffMembersV1(request),
      );
      const staffMember = response.records[0];
      this.form.setValue({
        name: staffMember.name,
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        email: staffMember.email,
        workHours: staffMember.workHours,
        vacationHours: staffMember.vacationHours,
        jurisdiciton: staffMember.jurisdiciton,
        startDate: staffMember.startDate || null,
        endDate: staffMember.endDate || null,
      });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
