import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { Jurisdiciton } from '../../models/staff-members/get-staff-member-v1';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';



interface Form {
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorDisplayComponent],
  templateUrl: './staff-edit.component.html'
})
export class StaffEditComponent implements OnInit {
  staffId?: string;
  apiErrors: string[] = [];
  showStaffMembers$ = new BehaviorSubject<boolean | null>(null);
  Jurisdiction = Jurisdiciton

  form = new FormGroup<Form>({
    firstName: new FormControl(null, {
      validators: [ Validators.minLength(1)],
    }),
    lastName: new FormControl(null, {
      validators: [ Validators.minLength(1)],
    }),
    email: new FormControl(null, {
      validators: [ Validators.email],
    }),
    workHours: new FormControl(0, {
      validators: [ Validators.min(0)],
    }),
    vacationHours: new FormControl(0, {
      validators: [ Validators.min(0)],
    }),
    jurisdiciton: new FormControl(Jurisdiciton.USA, {
      validators: []
    }),
    startDate: new FormControl(null, {
      validators: []
    }),
    endDate: new FormControl(null, {
    }),
  });
  async ngOnInit() {
    this.staffId =
      (await (
        await firstValueFrom(this.route.paramMap.pipe())
      ).get('staffId')) ?? undefined;
    this.getStaff();

  }


  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  async submit() {
    this.form.markAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error']
      return;
    }
    this.apiErrors = [];
    console.log('Form is valid');

    try {
      var request = { id: this.staffId, ...this.form.value };
      const response = await firstValueFrom(
        this.hqService.upsertStaffV1(request)
      );
      console.log(response.id);
      this.router.navigate(['../', response.id], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }

  private async getStaff() {
    try {
      const request = { id: this.staffId };
      const response = await firstValueFrom(this.hqService.getStaffMembersV1(request));
      const staffMember = response.records[0];
      this.form.setValue({
        firstName: staffMember.firstName || null,
        lastName: staffMember.lastName || null,
        email: staffMember.email || null,
        workHours: staffMember.workHours || null,
        vacationHours: staffMember.vacationHours || null,
        jurisdiciton: staffMember.jurisdiciton || null,
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

