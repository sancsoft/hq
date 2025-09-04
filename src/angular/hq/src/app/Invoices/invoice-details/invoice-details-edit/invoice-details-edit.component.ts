import { Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, firstValueFrom, Subject } from 'rxjs';

import { CommonModule } from '@angular/common';
import { HQService } from '../../../services/hq.service';
import { InRolePipe } from '../../../pipes/in-role.pipe';
import { HQRole } from '../../../enums/hqrole';
import { APIError } from '../../../errors/apierror';
import { ButtonComponent } from '../../../core/components/button/button.component';
import { GetClientRecordV1 } from '../../../models/clients/get-client-v1';
import { CoreModule } from '../../../core/core.module';
import { GetChargeCodeRecordV1 } from '../../../models/charge-codes/get-chargecodes-v1';
import { InvoiceDetaisService } from '../../service/invoice-details.service';
import { GetInvoiceDetailsRecordV1 } from '../../../models/Invoices/get-invoice-details-v1';
import { ModalService } from '../../../services/modal.service';

interface invoiceFormGroup {
  clientId: FormControl<string | null>;
  date: FormControl<string | null>;
  invoiceNumber: FormControl<string | null>;
  total: FormControl<number | null>;
  totalApprovedHours: FormControl<number | null>;
}

@Component({
  selector: 'hq-invoice-details-edit',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    InRolePipe,
  ],
  templateUrl: './invoice-details-edit.component.html',
})
export class InvoiceDetailsEditComponent implements OnDestroy {
  HQRole = HQRole;
  editMode: boolean = false;

  apiErrors: string[] = [];

  invoiceFormGroup = new FormGroup<invoiceFormGroup>(
    {
      clientId: new FormControl(null, [Validators.required]),
      date: new FormControl<string | null>(null, [Validators.required]),
      invoiceNumber: new FormControl(null),
      total: new FormControl(null, [Validators.required]),
      totalApprovedHours: new FormControl(null, [Validators.required]),
    },
    { validators: this.dateRangeValidator },
  );

  clients$: Observable<GetClientRecordV1[]>;
  currentClient$: Observable<GetClientRecordV1>;
  invoice$: Observable<GetInvoiceDetailsRecordV1>;

  invoiceId?: string;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private invoiceDetailsService: InvoiceDetaisService,
    private modalService: ModalService,
  ) {
    this.invoice$ = this.invoiceDetailsService.invoice$.pipe(
      map((i) => {
        if (i) {
          this.invoiceId = i.id;
          this.invoiceFormGroup.patchValue(i);
        } else {
          void this.router.navigateByUrl('/invoices');
        }
        return i;
      }),
    );

    this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
    this.currentClient$ = this.invoiceDetailsService.client$.pipe(
      map((client) => client),
    );
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSubmit() {
    this.invoiceFormGroup.markAllAsTouched();

    try {
      if (this.invoiceFormGroup.valid) {
        const request = {
          id: this.invoiceId,
          date: this.invoiceFormGroup.value.date,
          invoiceNumber: this.invoiceFormGroup.value.invoiceNumber,
          total: this.invoiceFormGroup.value.total,
          totalApprovedHours: this.invoiceFormGroup.value.totalApprovedHours,
        };

        if (this.invoiceFormGroup.touched && this.invoiceFormGroup.dirty) {
          await firstValueFrom(this.hqService.updateInvoiceV1(request));
          this.invoiceDetailsService.invoiceRefresh();
        }
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

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    return startDate && endDate && startDate > endDate
      ? { invalidDateRange: true }
      : null;
  }

  async save() {
    console.log(' Save hit');
    if (this.invoiceFormGroup.valid && this.invoiceFormGroup.dirty) {
      // this.hqInvoiceTimeChange.emit(this.invoiceFormGroup.value);
      this.invoiceFormGroup.reset();
      this.invoiceFormGroup.markAsPristine();
      // if (!this.invoiceFormGroup.value.id) {
      //   this.hoursInput?.nativeElement?.focus();
      // }
    }
  }

  async chooseDate() {
    const newDate = await firstValueFrom(
      this.modalService.chooseDate(
        'Change Date',
        'Choose a date for a new time entry to be created on.',
        this.invoiceFormGroup.controls.date.value ?? '',
      ),
    );
    if (newDate) {
      this.invoiceFormGroup.patchValue({ date: newDate });
      this.invoiceFormGroup.markAsDirty();
      await this.save();
    }
  }
}
