import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { HQService } from '../../services/hq.service';
import { ToastService } from '../../services/toast.service';
import { localISODate } from '../../common/functions/local-iso-date';
import { ProjectStatus } from '../../enums/project-status';
import { PdfViewerComponent } from '../../core/components/pdf-viewer/pdf-viewer.component';
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
  selector: 'hq-quotes-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectableClientListComponent,
    PdfViewerComponent,
    RouterLink,
    CoreModule,
  ],
  templateUrl: './quotes-create.component.html',
})
export class QuotesCreateComponent implements OnInit {
  quoteStatus = ProjectStatus;
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
    date: new FormControl(localISODate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    quoteNumber: new FormControl(null, {}),
    description: new FormControl(null, {}),
    pdf: new FormControl(null, {}),
  });

  clients$: Observable<GetClientRecordV1[]>;

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
    this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
  }

  async ngOnInit() {
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) {
      this.quoteFormGroup.patchValue({ clientId });
    }
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
        const request = {
          ...this.quoteFormGroup.value,
          quoteNumber: this.quoteFormGroup.value.quoteNumber || null,
        };
        console.log('Sending Request:', request);
        const response = await firstValueFrom(
          this.hqService.upsertQuoteV1(request),
        );
        console.log(response.id);

        if (this.quoteFormGroup.value.pdf) {
          await firstValueFrom(
            this.hqService.uploadQuotePDFV1(
              response.id,
              this.quoteFormGroup.value.pdf,
            ),
          );
        }

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
}
