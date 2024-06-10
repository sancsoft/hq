import { PdfViewerComponent } from './../../common/pdf-viewer/pdf-viewer.component';
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
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ClientListComponent } from '../../clients/client-list/client-list.component';
import { GetQuotesRecordV1 } from '../../models/quotes/get-quotes-v1';
import { APIError } from '../../errors/apierror';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { UpsertProjectRequestV1 } from '../../models/projects/upsert-project-v1';
import { Router, ActivatedRoute } from '@angular/router';

export enum Period {
  Week = 1,
  Month = 2,
  Quarter = 3,
  Year = 4,
}

interface Form {
  clientId: FormControl<string | null>;
  name: FormControl<string | null>;
  projectManagerId: FormControl<string | null>;
  hourlyRate: FormControl<number | null>;
  totalHours: FormControl<number | null>;
  bookingPeriod: FormControl<number | null>;
  quoteId: FormControl<string | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
}
@Component({
  selector: 'hq-project-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectableClientListComponent,
    PdfViewerComponent,

  ],
  templateUrl: './project-create.component.html',
})

export class ProjectCreateComponent {
  projectManagers$: Observable<GetStaffV1Record[]>;
  quotes$: Observable<GetQuotesRecordV1[]>;
  selectedQuote$ = new Observable<string>();
  quotePdfURL = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';

  apiErrors: string[] = [];
  selectedClientName$ = new BehaviorSubject<string | null>(null);
  generatedChargeCode$ = new BehaviorSubject<string | null>(null);

  projectFormGroup = new FormGroup<Form>(
    {
      clientId: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      projectManagerId: new FormControl(null, [Validators.required]),
      hourlyRate: new FormControl(0, [Validators.required, Validators.min(0)]),
      totalHours: new FormControl(0, [Validators.required, Validators.min(0)]),
      bookingPeriod: new FormControl(null, [
        Validators.required,
        Validators.min(0),
      ]),
      quoteId: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
    },
    { validators: this.dateRangeValidator }
  );



  modalOpen$ = new BehaviorSubject<boolean>(false);

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute
  ) {
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
    this.selectedClientName$.next(client.name);
  }
  projectManagerSelected(id: string) {
    this.projectFormGroup.get('projectManagerId')?.setValue(id);
  }
  quoteSelected(event: any) {
    let quoteId = event.value;
    this.selectedQuote$ = this.quotes$.pipe(
      map((quotes) => {
        console.log(quotes);
        const quote = quotes.find((quote) => quote.id === quoteId);
        return quote ? quote.chargeCode : 'Quote not found';
      })
    );
  }

  async onSubmitProject() {
    console.log(this.projectFormGroup);
    try {
      if (
        this.projectFormGroup.valid &&
        this.projectFormGroup.touched &&
        this.projectFormGroup.dirty
      ) {
        const request = this.projectFormGroup.value;
        request.bookingPeriod = Number(request.bookingPeriod);
        console.log('Sending Request:', request);
        const response = await firstValueFrom(
          this.hqService.upsertProjectV1(request)
        );
        this.generatedChargeCode$.next(response.chargeCode)
        console.log(response.id);
        this.router.navigate(['../', response.id], { relativeTo: this.route });
      } else {
        this.apiErrors.push(
          'Please correct the errors in the form before submitting.'
        );
      }
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
        console.log(this.apiErrors);
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
  openModal() {
    this.modalOpen$.next(true);
  }

  closeModal() {
    this.modalOpen$.next(false);
  }

  modalOkClicked() {
    this.closeModal();
  }
  modalCancelClicked() {
    this.selectedClientName$.next(null);
    this.closeModal();
  }



  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    return startDate && endDate && startDate > endDate
      ? { invalidDateRange: true }
      : null;
  }
}
