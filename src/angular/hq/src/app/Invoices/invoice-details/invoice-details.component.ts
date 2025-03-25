import { ClientDetailsSearchFilterComponent } from './../../clients/client-details/client-details-search-filter/client-details-search-filter.component';
import { SortIconComponent } from './../../common/sort-icon/sort-icon.component';
import { SortColumn } from './../../models/Invoices/get-invoices-v1';

import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Observable,
  startWith,
  combineLatest,
  map,
  tap,
  debounceTime,
  switchMap,
  shareReplay,
  BehaviorSubject,
  firstValueFrom,
  Subject,
  first,
  takeUntil,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import { ClientDetailsServiceToReplace } from '../../clients/client-details.service';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortDirection } from '../../models/common/sort-direction';
import { GetInvoicesRecordV1 } from '../../models/Invoices/get-invoices-v1';
import { HQService } from '../../services/hq.service';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { localISODate } from '../../common/functions/local-iso-date';
import { APIError } from '../../errors/apierror';
import { ButtonComponent } from '../../core/components/button/button.component';
import { SelectInputComponent } from '../../core/components/select-input/select-input.component';
import { TextInputComponent } from '../../core/components/text-input/text-input.component';
import { DateInputComponent } from '../../core/components/date-input/date-input.component';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { CoreModule } from '../../core/core.module';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { InvoiceDetaisService } from '../service/invoice-details.service';

interface invoiceFormGroup {
  clientId: FormControl<string | null>;
  date: FormControl<Date | null>;
  invoiceNumber: FormControl<string | null>;
  total: FormControl<number | null>;
  totalApprovedHours: FormControl<number | null>;
}

@Component({
  selector: 'hq-invoice-details',
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
  templateUrl: './invoice-details.component.html',
})
export class InvoiceDetailsComponent {
  // invoiceId$: Observable<string>;
  // invoice$: Observable<GetInvoicesRecordV1>;
  invoice?: GetInvoicesRecordV1;

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
    const invoiceId$ = this.route.paramMap.pipe(
      map((params) => params.get('invoiceId')),
    );

    invoiceId$.subscribe({
      next: (invoiceId) => this.invoiceDetailsService.setInvoiceId(invoiceId),
      error: console.error,
    });

    this.invoiceDetailsService.invoice$.pipe(takeUntil(this.destroy)).subscribe(
      (invoice) => {
        if(invoice){
          this.invoice = invoice;
          this.invoiceFormGroup.patchValue(invoice);
        }
      });
    // this.invoice$ = route.parent!.paramMap.pipe(
    //   map((params) => params.get('invoiceId')),
    //   switchMap((invoiceId) => this.hqService.getInvoicesV1({ id: invoiceId ?? undefined })),
    //   map((t) => t.records[0]),
    // );
    this.clients$ = hqService.getClientsV1({}).pipe(map((t) => t.records));
    this.invoiceDetailsService.client$.subscribe((client) => {
      this.currentClient = client;
    });    
  }
  
  // async ngOnInit() {
    
    
  //   // await this.getInvoice();
  //   // console.log("Client name: ", this.invoice?.clientName);
  //   // this.currentClient = await firstValueFrom(this.clients$.pipe(map((r) => r.find(c => c.name == this.invoice?.clientName))));
  //   await this.getChargeCodes();
  //   // console.log("Invoice returned:", this.invoice);
  // }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSubmit() {
    this.invoiceFormGroup.markAllAsTouched();

    try {
      if (this.invoiceFormGroup.valid && this.invoiceFormGroup.touched && this.invoiceFormGroup.dirty) {
        const request = this.invoiceFormGroup.value;
        const response = await firstValueFrom(
          this.hqService.upsertInvoiceV1(request),
        );

        await this.router.navigate(['../', response.id], {
          relativeTo: this.route,
        });
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