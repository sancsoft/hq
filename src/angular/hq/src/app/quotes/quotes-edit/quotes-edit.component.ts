import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { QuoteStatus } from '../../models/common/quote-status';
import { ToastService } from '../../services/toast.service';

interface quoteFormGroup {
  clientId: FormControl<string>;
  name: FormControl<string>;
  value: FormControl<number | null>;
  status: FormControl<number | null>;
  date: FormControl<Date | null>;
  quoteNumber: FormControl<number | null>;
}

@Component({
  selector: 'hq-quote-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    RouterLink,
    SelectableClientListComponent,
  ],
  templateUrl: './quotes-edit.component.html',
})
export class QuotesEditComponent implements OnInit {
  modalOpen$ = new BehaviorSubject<boolean>(false);
  selectedQuote$ = new Observable<string>();
  quoteStatus = QuoteStatus;
  quotePdfURL = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  quoteId?: string;
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
    date: new FormControl(new Date(), {
      validators: [Validators.required],
    }),
    quoteNumber: new FormControl(null, {}),
  });

  async ngOnInit() {
    this.quoteId =
      (await (
        await firstValueFrom(this.route.paramMap.pipe())
      ).get('quoteId')) ?? undefined;
    await this.getQuote();
  }

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
  async onSubmit() {
    this.quoteFormGroup.markAllAsTouched();
    console.log(this.quoteFormGroup.value);
    if (this.quoteFormGroup.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error'];
      return;
    }
    this.apiErrors = [];
    console.log('Form is valid');

    try {
      const request = { id: this.quoteId, ...this.quoteFormGroup.value };
      request.status = Number(request.status);
      const response = await firstValueFrom(
        this.hqService.upsertQuoteV1(request),
      );
      console.log(response);
      await this.router.navigate(['../../'], { relativeTo: this.route });
      this.toastService.show('Updated', 'Quote has been updated');
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

  private async getQuote() {
    try {
      const request = { id: this.quoteId };
      const response = await firstValueFrom(
        this.hqService.getQuotesV1(request),
      );
      const quoteMember = response.records[0];
      this.quoteFormGroup.setValue({
        clientId: quoteMember.clientId,
        name: quoteMember.name,
        status: Number(quoteMember.status) ?? null,
        value: quoteMember.value ?? null,
        date: quoteMember.date ?? null,
        quoteNumber: quoteMember.quoteNumber ?? null,
      });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
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
