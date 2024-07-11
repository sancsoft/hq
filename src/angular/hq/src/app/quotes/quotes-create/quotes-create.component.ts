import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { HQService } from '../../services/hq.service';
import { QuoteStatus } from '../../models/common/quote-status';
import { ToastService } from '../../services/toast.service';
import { localISODate } from '../../common/functions/local-iso-date';
import { PdfViewerComponent } from '../../core/components/pdf-viewer/pdf-viewer.component';

interface quoteFormGroup {
  clientId: FormControl<string>;
  name: FormControl<string>;
  value: FormControl<number | null>;
  status: FormControl<number | null>;
  date: FormControl<string | null>;
  quoteNumber: FormControl<number | null>;
}
@Component({
  selector: 'hq-quotes-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectableClientListComponent,
    PdfViewerComponent,
    RouterLink,
  ],
  templateUrl: './quotes-create.component.html',
})
export class QuotesCreateComponent {
  modalOpen$ = new BehaviorSubject<boolean>(false);
  selectedQuote$ = new Observable<string>();
  quoteStatus = QuoteStatus;
  quotePdfURL = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';

  apiErrors: string[] = [];
  selectedClientName$ = new BehaviorSubject<string | null>(null);

  quoteFormGroup = new FormGroup<quoteFormGroup>({
    clientId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    value: new FormControl(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    status: new FormControl(1, {
      validators: [Validators.required],
    }),
    date: new FormControl(localISODate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    quoteNumber: new FormControl(null, {}),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {}
  updateSelectedClient(client: GetClientRecordV1) {
    console.log(client);
    this.quoteFormGroup.get('clientId')?.setValue(client.id);
    this.selectedClientName$.next(client.name);
  }
  async onSubmitProject() {
    this.quoteFormGroup.markAllAsTouched();
    console.log(this.quoteFormGroup);
    try {
      if (
        this.quoteFormGroup.valid &&
        this.quoteFormGroup.touched &&
        this.quoteFormGroup.dirty
      ) {
        const request = this.quoteFormGroup.value;
        console.log('Sending Request:', request);
        const response = await firstValueFrom(
          this.hqService.upsertQuoteV1(request),
        );
        console.log(response.id);
        await this.router.navigate(['../'], { relativeTo: this.route });
        this.toastService.show('Accepted', 'Quote has been created.');
      } else {
        this.apiErrors.length = 0;
        this.apiErrors.push(
          'Please correct the errors in the form before submitting.',
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
}
