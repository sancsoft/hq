import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';

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
  selector: 'hq-users-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './users-edit.component.html',
})
export class UsersEditComponent implements OnInit {
  userId?: string;
  staffMembers$: Observable<GetStaffV1Record[]>;
  showStaffMembers$ = new BehaviorSubject<boolean | null>(null);

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
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

  async ngOnInit() {
    this.userId =
      (await (
        await firstValueFrom(this.route.paramMap.pipe())
      ).get('userId')) ?? undefined;
    this.getUser();
  }
  apiErrors?: string[];

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

  private async getUser() {
    try {
      const request = { id: this.userId };
      const response = await firstValueFrom(this.hqService.getUsersV1(request));
      const user = response.records[0];
      this.form.setValue({
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        email: user.email || null,
        staffId: user.staffId || null,
        enabled: user.enabled ? user.enabled : false,
        isStaff: user.isStaff ? user.isStaff : false,
        isManager: user.isManager ? user.isManager : false,
        isPartner: user.isPartner ? user.isPartner : false,
        isExecutive: user.isExecutive ? user.isExecutive : false,
        isAdministrator: user.isAdministrator ? user.isAdministrator : false,
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
    this.form.markAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      var request = { id: this.userId, ...this.form.value };
      const response = await firstValueFrom(
        this.hqService.upsertUsersV1(request),
      );
      this.router.navigate(['../../'], { relativeTo: this.route });
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
