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
  filter,
  takeUntil,
  Subject,
  firstValueFrom,
} from 'rxjs';

import { CommonModule } from '@angular/common';
import { ClientDetailsServiceToReplace } from '../../clients/client-details.service';
import { PaginatorComponent } from '../../common/paginator/paginator.component';
import { SortDirection } from '../../models/common/sort-direction';
import { GetInvoicesRecordV1 } from '../../models/Invoices/get-invoices-v1';
import { HQService } from '../../services/hq.service';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { Period } from '../../enums/period';
import { ProjectType } from '../../enums/project-type';
import { ProjectStatus } from '../../enums/project-status';
import { localISODate } from '../../common/functions/local-iso-date';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { formControlChanges } from '../../core/functions/form-control-changes';
import { APIError } from '../../errors/apierror';
import { CoreModule } from '../../core/core.module';

interface Form {
  clientId: FormControl<string | null>;
  date: FormControl<Date | null>;
  invoiceNumber: FormControl<string | null>;
  total: FormControl<number | null>;
  totalApprovedHours: FormControl<number | null>;
}

@Component({
  selector: 'hq-invoices-create',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorComponent,
    SortIconComponent,
    ClientDetailsSearchFilterComponent,
    InRolePipe,
    CoreModule
  ],
  templateUrl: './invoices-create.component.html',
})
export class InvoicesCreateComponent {
  clients$: Observable<GetClientRecordV1[]>;

  apiErrors: string[] = [];

  form = new FormGroup<Form>(
    {
      clientId: new FormControl(null, [Validators.required]),
      invoiceNumber: new FormControl(null),
      totalApprovedHours: new FormControl(null, [Validators.required]),
      total: new FormControl(null, [Validators.required]),
      date: new FormControl(null, Validators.required),
    },
    { validators: this.dateRangeValidator },
  );

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.clients$ = this.hqService.getClientsV1({}).pipe(
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const clientId$ = formControlChanges(this.form.controls.clientId);

    const selectedClient$ = combineLatest({
      clientId: clientId$,
      clients: this.clients$,
    }).pipe(map((t) => t.clients.find((x) => x.id == t.clientId)));
  }

  async ngOnInit() {
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) {
      this.form.patchValue({ clientId });
    }
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSubmit() {
    this.form.markAllAsTouched();

    try {
      if (this.form.valid && this.form.touched && this.form.dirty) {
        const request = this.form.value;
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
}
