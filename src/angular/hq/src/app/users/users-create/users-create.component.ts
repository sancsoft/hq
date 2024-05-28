import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';

interface Form {
  firstName: FormControl<string | null>;
  LastName: FormControl<string | null>;
  email: FormControl<string | null>;
  StaffId: FormControl<string | null>;
  Enabled: FormControl<boolean | null>;
  IsStaff: FormControl<boolean | null>;
  IsManager: FormControl<boolean | null>;
  IsPartner: FormControl<boolean | null>;
  IsExecutive: FormControl<boolean | null>;
  IsAdministrator: FormControl<boolean | null>;
}

@Component({
  selector: 'hq-users-create',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './users-create.component.html',
})
export class UsersCreateComponent {
  apiErrors?: string[];

  form = new FormGroup<Form>({
    firstName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    LastName: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(1)],
    }),
    email: new FormControl(null, {
      validators: [Validators.required, Validators.email],
    }),
    StaffId: new FormControl(null),
    Enabled: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    IsStaff: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    IsManager: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    IsPartner: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    IsExecutive: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    IsAdministrator: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async submit() {
    this.form.markAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      const request = this.form.value;
      const response = await firstValueFrom(
        this.hqService.upsertUsersV1(request)
      );
      this.router.navigate(['../', response.id], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
