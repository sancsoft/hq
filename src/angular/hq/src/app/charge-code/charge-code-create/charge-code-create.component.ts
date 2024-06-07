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
import {
  Jurisdiciton,
} from '../../models/staff-members/get-staff-member-v1';
import { HQService } from '../../services/hq.service';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';


interface Form {
  ChargeCodeActivity: FormControl<ChargeCodeActivity | null>;
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorDisplayComponent],
  templateUrl: './charge-code-create.component.html'
})
export class ChargeCodeCreateComponent {
  apiErrors: string[] = [];
  ChargeCodeActivity = ChargeCodeActivity;
  
  showProjects$ = new BehaviorSubject<boolean | null>(null);
  showQuotes$ = new BehaviorSubject<boolean | null>(null);
  showServices$ = new BehaviorSubject<boolean | null>(null);




  form = new FormGroup<Form>({
    ChargeCodeActivity: new FormControl(null, {
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
      validators: [],
    }),
        Active: new FormControl(null, {
      validators: [],
    }),
      Description: new FormControl(null, {
      validators: [],
    }),
    
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form.controls.ChargeCodeActivity.valueChanges.subscribe((chargeCodeActivity)=>{
      this.showProjects$.next(false);
      this.showQuotes$.next(false);
      this.showServices$.next(false);

      switch(chargeCodeActivity) {
        case(ChargeCodeActivity.Project):
        this.showProjects$.next(true);
        break;
        case(ChargeCodeActivity.Quote):
        this.showQuotes$.next(true);
        break;
        case(ChargeCodeActivity.Service):
        this.showServices$.next(true);
        break;
      }
    })
  }

  async submit() {
    this.form.markAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error']
      return;
    }
    console.log('Form is valid');

    try {
      const request = this.form.value;
      // const response = await firstValueFrom(
      //   // this.hqService.upsertStaffV1(request)
      // );
      this.router.navigate(['../'], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
