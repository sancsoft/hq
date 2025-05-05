import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Observable,
  map,
  firstValueFrom,
  Subject,
  takeUntil,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import { GetInvoicesRecordV1 } from '../../../models/Invoices/get-invoices-v1';
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


interface invoiceFormGroup {
  clientId: FormControl<string | null>;
  date: FormControl<Date | null>;
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
export class InvoiceDetailsEditComponent {
  HQRole = HQRole;
  invoice?: GetInvoiceDetailsRecordV1;

  editMode: boolean = false;

  apiErrors: string[] = [];

  invoiceFormGroup = new FormGroup<invoiceFormGroup>(
    {
      clientId: new FormControl(null, [Validators.required]),
      date: new FormControl(null, Validators.required),
      invoiceNumber: new FormControl(null),
      total: new FormControl(null, [Validators.required]),
      totalApprovedHours: new FormControl(null, [Validators.required]),
    },
    { validators: this.dateRangeValidator },
  );
  
  clients$: Observable<GetClientRecordV1[]>;
  currentClient?: GetClientRecordV1;
  chargeCodes?: Array<GetChargeCodeRecordV1>;

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private invoiceDetailsService: InvoiceDetaisService
  ) {
    this.invoiceDetailsService.invoice$.pipe(takeUntil(this.destroy)).subscribe(
      (invoice) => {
        if(invoice){
          this.invoice = invoice;
          this.invoiceFormGroup.patchValue(invoice);
        }
      });

    this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
    this.invoiceDetailsService.client$.subscribe((client) => {
      this.currentClient = client;
    });    
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSubmit() {
    this.invoiceFormGroup.markAllAsTouched();

    try {
      if (this.invoiceFormGroup.valid && this.invoiceFormGroup.touched && this.invoiceFormGroup.dirty) {
        const request = {
          id: this.invoice?.id,
          date: this.invoiceFormGroup.value.date,
          invoiceNumber: this.invoiceFormGroup.value.invoiceNumber,
          total: this.invoiceFormGroup.value.total,
          totalApprovedHours: this.invoiceFormGroup.value.totalApprovedHours
        };
        const response = await firstValueFrom(
          this.hqService.updateInvoiceV1(request),
        );

        this.invoiceDetailsService.invoiceRefresh();
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

  // private async getInvoice() {
  //   try {
  //     // const request = { id: this.invoiceId };
  //     // const response = await firstValueFrom(
  //     //   this.hqService.getInvoicesV1(request),
  //     // );
  //     // const invoiceMember = response.records[0];
  //     // this.invoice = invoiceMember;
  //     const invoiceMember = await firstValueFrom(this.invoice$);
  //     this.invoiceFormGroup.patchValue(invoiceMember);
  //   } catch (err) {
  //     if (err instanceof APIError) {
  //       this.apiErrors = err.errors;
  //     } else {
  //       this.apiErrors = ['An unexpected error has occurred.'];
  //     }
  //   }
  // }

  private async getChargeCodes() {
    // needs to gather all the charge codes assigned to the invoice on the time tab
    // this.chargeCodes = ;
  }
}