import { GetStaffV1Record } from './../../models/staff-members/get-staff-member-v1';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
interface Form {
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  email: FormControl<string | null>;
  staffId: FormControl<string | null>;
  enabled: FormControl<boolean | null>;
  isStaff: FormControl<boolean | null>;
  isManager: FormControl<boolean | null>;
  isPartner: FormControl<boolean | null>;
  isExecutive: FormControl<boolean | null>;
  isAdministrator: FormControl<boolean | null>;
}

@Component({
  selector: 'hq-users-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './users-create.component.html',
})
export class UsersCreateComponent {
  apiErrors: string[] = [];
  staffMembers$: Observable<GetStaffV1Record[]>;
  showStaffMembers$ = new BehaviorSubject<boolean | null>(null);

  form = new FormGroup<Form>({
    firstName: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    lastName: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    email: new FormControl(null, {
      validators: [Validators.required, Validators.email],
    }),
    staffId: new FormControl(null),
    enabled: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isStaff: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isManager: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isPartner: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isExecutive: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isAdministrator: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
    const response$ = this.hqService.getStaffMembersV1({});
    this.staffMembers$ = response$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    this.form.controls.isStaff.valueChanges.subscribe((value) => {
      this.showStaffMembers$.next(value);
      if (value) {
        this.form.controls.staffId.setValidators([Validators.required]);
        this.form.controls.staffId.updateValueAndValidity();
      } else {
        this.form.controls.staffId.clearValidators();
        this.form.controls.staffId.updateValueAndValidity();
      }
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors.length = 0;
      this.apiErrors.push(
        'Please correct the errors in the form before submitting.',
      );
      return;
    }
    console.log('Form is valid');

    try {
      const request = this.form.value;
      await firstValueFrom(this.hqService.upsertUsersV1(request));
      this.router.navigate(['../'], { relativeTo: this.route });
      this.toastService.show('Accepted', 'Client has been created.');
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
