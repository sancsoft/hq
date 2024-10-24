import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { ToastService } from '../../services/toast.service';
import { ProjectStatus } from '../../enums/project-status';
import { CoreModule } from '../../core/core.module';
import { enumToArrayObservable } from '../../core/functions/enum-to-array';

interface quoteFormGroup {
  clientId: FormControl<string | null>;
  name: FormControl<string>;
  value: FormControl<number | null>;
  status: FormControl<number | null>;
  date: FormControl<string | null>;
  description: FormControl<string | null>;
  quoteNumber: FormControl<number | null>;
  pdf: FormControl<File | null>;
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
    CoreModule,
  ],
  templateUrl: './quotes-edit.component.html',
})
export class QuotesEditComponent implements OnInit {
  quoteStatus = ProjectStatus;
  quoteId?: string;
  apiErrors: string[] = [];

  public projectStatusEnum$ = enumToArrayObservable(ProjectStatus);

  quoteFormGroup = new FormGroup<quoteFormGroup>({
    clientId: new FormControl(null, {
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
    date: new FormControl(null, {
      validators: [Validators.required],
    }),
    description: new FormControl(null, {}),
    quoteNumber: new FormControl(null, {}),
    pdf: new FormControl(null, {}),
  });

  async ngOnInit() {
    this.quoteId =
      (await (
        await firstValueFrom(this.route.paramMap.pipe())
      ).get('quoteId')) ?? undefined;
    await this.getQuote();
  }

  clients$: Observable<GetClientRecordV1[]>;

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
    this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
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
      const request = {
        id: this.quoteId,
        ...this.quoteFormGroup.value,
        quoteNumber: this.quoteFormGroup.value.quoteNumber || null,
      };
      request.status = Number(request.status);
      const response = await firstValueFrom(
        this.hqService.upsertQuoteV1(request),
      );
      console.log(response);

      if (this.quoteFormGroup.value.pdf) {
        await firstValueFrom(
          this.hqService.uploadQuotePDFV1(
            response.id,
            this.quoteFormGroup.value.pdf,
          ),
        );
      }

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
      this.quoteFormGroup.patchValue(quoteMember);
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
