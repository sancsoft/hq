import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { PdfViewerComponent } from '../../common/pdf-viewer/pdf-viewer.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, map, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { HQService } from '../../services/hq.service';
import { QuoteStatus } from '../../models/common/quote-status';

@Component({
  selector: 'hq-quotes-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectableClientListComponent,
    PdfViewerComponent,
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

  quoteFormGroup = new FormGroup({
    clientId: new FormControl('', Validators.required),
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    value: new FormControl(null, [Validators.required, Validators.min(0)]),
    status: new FormControl(0, [Validators.required]),
    date: new FormControl(new Date(), Validators.required),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  updateSelectedClient(client: GetClientRecordV1) {
    console.log(client);
    this.quoteFormGroup.get('clientId')?.setValue(client.id);
    this.selectedClientName$.next(client.name);
  }
  async onSubmitProject() {
    console.log(this.quoteFormGroup);
    try {
      if (
        this.quoteFormGroup.valid &&
        this.quoteFormGroup.touched &&
        this.quoteFormGroup.dirty
      ) {
        const request = this.quoteFormGroup.value;
        request.status = Number(request.status);
        console.log('Sending Request:', request);
        const response = await firstValueFrom(
          this.hqService.upsertQuoteV1(request),
        );
        console.log(response.id);
        this.router.navigate(['../', response.id], { relativeTo: this.route });
      } else {
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
