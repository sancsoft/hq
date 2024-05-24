import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  debounceTime,
  firstValueFrom,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';
import { HQService } from '../../services/hq.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClientListComponent } from '../../clients/client-list/client-list.component';
import { GetQuotesRecordV1 } from '../../models/quotes/get-quotes-v1';
import { APIError } from '../../errors/apierror';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';

export enum Period {
  Week = 1,
  Month = 2,
  Quarter = 3,
  Year = 4,
}

@Component({
  selector: 'hq-project-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientListComponent,
  ],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent {
  projectManagers$: Observable<GetStaffV1Record[]>;
  quotes$: Observable<GetQuotesRecordV1[]>;
  selectedQuoteChargeCode$ = new BehaviorSubject<string>('');

  apiErrors?: string[];
  selectedClientName = new BehaviorSubject<string | null>(null);
  projectFormGroup = new FormGroup({
    clientId: new FormControl(''),
    name: new FormControl('', Validators.required),
    projectManagerId: new FormControl(''),
    hourlyRate: new FormControl(0, [Validators.required, Validators.min(0)]),
    totalHours: new FormControl('', [Validators.required, Validators.min(0)]),
    bookingPeriod: new FormControl(0, [Validators.required, Validators.min(0)]),
    quoteId: new FormControl('', Validators.required),
    startDate: new FormControl(new Date(), Validators.required),
    endDate: new FormControl(new Date(), Validators.required),
  });

  modalOpen = false;
  constructor(private hqService: HQService) {
    const response$ = this.hqService.getStaffMembersV1({});
    const quotesResponse$ = this.hqService.getQuotesV1({});

    this.projectManagers$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );

    this.quotes$ = quotesResponse$.pipe(
      map((response) => {
        return response.records;
      })
    );
    this.quotes$.subscribe((records) => {
      console.log(records);
    });
  }
  updateSelectedClient(client: GetClientRecordV1) {
    console.log(client);
    this.projectFormGroup.get('clientId')?.setValue(client.id);
    this.selectedClientName.next(client.name);
  }
  projectManagerSelected(id: string) {
    this.projectFormGroup.get('projectManagerId')?.setValue(id);
  }
  quoteSelected(quote: GetQuotesRecordV1) {
    this.selectedQuoteChargeCode$.next(quote.chargeCode);
    console.log(this.selectedQuoteChargeCode$);
  }

  async onSubmitProject() {
    console.log('test');
    console.log(this.projectFormGroup);

    try {

      if (this.projectFormGroup.valid) {
        const request = this.projectFormGroup.value;
      console.log('Sending Request:', request);
      const response = await firstValueFrom(this.hqService.upsertProjectV1(request));
      console.log(response);

      }
      // this.router.navigate(['../', response.id], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }

      // this.form.markAsTouched();
      // if(this.form.invalid) {
      //   return;
      // }
    }
  }
}
