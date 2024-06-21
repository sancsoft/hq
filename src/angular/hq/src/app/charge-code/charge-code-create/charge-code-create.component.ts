import { ChargeCodeActivity } from './../../models/charge-codes/get-chargecodes-v1';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, map, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { Jurisdiciton } from '../../models/staff-members/get-staff-member-v1';
import { HQService } from '../../services/hq.service';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { GetServicesRecordV1 } from '../../models/Services/get-services-v1';
import { GetQuotesRecordV1 } from '../../models/quotes/get-quotes-v1';

interface Form {
  Activity: FormControl<ChargeCodeActivity | null>;
  ProjectId: FormControl<string | null>;
  QuoteId: FormControl<string | null>;
  ServiceAgreementId: FormControl<string | null>;
  Billable: FormControl<boolean | null>;
  Active: FormControl<boolean | null>;
  Description: FormControl<string | null>;
}

@Component({
  selector: 'hq-charge-code-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
  ],
  templateUrl: './charge-code-create.component.html',
})
export class ChargeCodeCreateComponent {
  apiErrors: string[] = [];
  ChargeCodeActivity = ChargeCodeActivity;

  projects$: Observable<GetProjectRecordV1[]>;
  services$: Observable<GetServicesRecordV1[]>;
  quotes$: Observable<GetQuotesRecordV1[]>;

  showProjects$ = new BehaviorSubject<boolean | null>(null);
  showQuotes$ = new BehaviorSubject<boolean | null>(null);
  showServices$ = new BehaviorSubject<boolean | null>(null);

  form = new FormGroup<Form>({
    Activity: new FormControl(null, {
      validators: [Validators.required],
    }),
    ProjectId: new FormControl(null, {
      validators: [],
    }),
    QuoteId: new FormControl(null, {
      validators: [],
    }),
    ServiceAgreementId: new FormControl(null, {
      validators: [],
    }),
    Billable: new FormControl(null, {
      validators: [Validators.required],
    }),
    Active: new FormControl(null, {
      validators: [Validators.required],
    }),
    Description: new FormControl(null, {
      validators: [],
    }),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const quotesResponse$ = this.hqService.getQuotesV1({});
    this.quotes$ = quotesResponse$.pipe(
      map((response) => {
        return response.records;
      }),
    );
    const projectsResponse$ = this.hqService.getProjectsV1({});
    this.projects$ = projectsResponse$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    const servicesResponse$ = this.hqService.getServicesV1({});
    this.services$ = servicesResponse$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    this.form.controls.Activity.valueChanges.subscribe((chargeCodeActivity) => {
      this.form.controls.ProjectId.setValue(null);
      this.form.controls.QuoteId.setValue(null);
      this.form.controls.ServiceAgreementId.setValue(null);

      this.showProjects$.next(false);
      this.showQuotes$.next(false);
      this.showServices$.next(false);

      switch (chargeCodeActivity) {
        case ChargeCodeActivity.Project:
          this.showProjects$.next(true);
          break;
        case ChargeCodeActivity.Quote:
          this.showQuotes$.next(true);
          break;
        case ChargeCodeActivity.Service:
          this.showServices$.next(true);
          break;
      }
    });
  }

  async submit() {
    this.form.markAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error'];
      return;
    }
    console.log('Form is valid');

    try {
      const request = this.form.value;
      const response = await firstValueFrom(
        this.hqService.upsertChargecodesV1(request),
      );
      this.router.navigate(['../'], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
