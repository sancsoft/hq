import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Observable,
  Subject,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';
import {
  GetStaffV1Record,
  SortColumn,
} from '../../models/staff-members/get-staff-member-v1';
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
import {
  GetQuotesRecordV1,
  SortColumn as QuoteSortColumn,
} from '../../models/quotes/get-quotes-v1';
import { APIError } from '../../errors/apierror';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { SelectableClientListComponent } from '../../clients/selectable-client-list/selectable-client-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { localISODate } from '../../common/functions/local-iso-date';
import { Period } from '../../enums/period';
import { PdfViewerComponent } from '../../core/components/pdf-viewer/pdf-viewer.component';
import { CoreModule } from '../../core/core.module';
import { enumToArray } from '../../core/functions/enum-to-array';
import { ProjectStatus } from '../../enums/project-status';
import { ProjectType } from '../../enums/project-type';
import { formControlChanges } from '../../core/functions/form-control-changes';
import { SortDirection } from '../../models/common/sort-direction';

interface Form {
  clientId: FormControl<string | null>;
  projectManagerId: FormControl<string | null>;
  name: FormControl<string | null>;
  quoteId: FormControl<string | null>;
  hourlyRate: FormControl<number | null>;
  bookingHours: FormControl<number | null>;
  bookingPeriod: FormControl<Period | null>;
  startDate: FormControl<string | null>;
  endDate: FormControl<string | null>;
  type: FormControl<ProjectType | null>;
  billable: FormControl<boolean | null>;
  status: FormControl<ProjectStatus | null>;
  totalHours: FormControl<number | null>;
  projectNumber: FormControl<number | null>;
  requireTask: FormControl<boolean | null>;
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
    CoreModule,
  ],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent implements OnDestroy, OnInit {
  projectManagers$: Observable<GetStaffV1Record[]>;
  quotes$: Observable<GetQuotesRecordV1[]>;
  clients$: Observable<GetClientRecordV1[]>;

  public projectStatusValues = enumToArray(ProjectStatus);
  public projectTypeValues = enumToArray(ProjectType);
  public bookingPeriodValues = enumToArray(Period, [
    Period.None,
    Period.Month,
    Period.Quarter,
    Period.Year,
  ]);

  apiErrors: string[] = [];

  form = new FormGroup<Form>(
    {
      clientId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      projectManagerId: new FormControl(null, [Validators.required]),
      hourlyRate: new FormControl(null, [Validators.required]),
      totalHours: new FormControl(null, [Validators.required]),
      bookingPeriod: new FormControl(Period.Month),
      quoteId: new FormControl(null, [Validators.required]),
      startDate: new FormControl(localISODate(), Validators.required),
      endDate: new FormControl(null),
      type: new FormControl(ProjectType.Ongoing),
      status: new FormControl(ProjectStatus.Draft),
      billable: new FormControl(true, { nonNullable: true }),
      bookingHours: new FormControl(null, [Validators.required]),
      projectNumber: new FormControl(null),
      requireTask: new FormControl(false, { nonNullable: true }),
    },
    { validators: this.dateRangeValidator },
  );

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.projectManagers$ = this.hqService
      .getStaffMembersV1({ sortBy: SortColumn.Name })
      .pipe(
        map((t) => t.records),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.clients$ = this.hqService.getClientsV1({}).pipe(
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const clientId$ = formControlChanges(this.form.controls.clientId);
    const quoteId$ = formControlChanges(this.form.controls.quoteId);
    const projectType$ = formControlChanges(this.form.controls.type);

    this.quotes$ = clientId$.pipe(
      switchMap((clientId) =>
        this.hqService.getQuotesV1({
          clientId,
          sortBy: QuoteSortColumn.QuoteNumber,
          sortDirection: SortDirection.Desc,
        }),
      ),
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    projectType$
      .pipe(takeUntil(this.destroy))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (type) => {
          switch (type) {
            case ProjectType.General:
              this.form.controls.quoteId.disable();
              this.form.controls.totalHours.disable();
              this.form.controls.projectNumber.disable();

              this.form.patchValue({
                quoteId: null,
                totalHours: null,
                projectNumber: null,
                billable: false,
                status: ProjectStatus.Ongoing,
              });

              this.form.controls.bookingPeriod.enable();
              this.form.controls.bookingHours.enable();
              break;
            case ProjectType.Ongoing:
              this.form.controls.quoteId.disable();
              this.form.controls.totalHours.disable();

              this.form.patchValue({
                quoteId: null,
                totalHours: null,
                billable: true,
              });

              this.form.controls.projectNumber.enable();
              this.form.controls.bookingPeriod.enable();
              this.form.controls.bookingHours.enable();
              break;
            case ProjectType.Quote:
              this.form.controls.projectNumber.disable();
              this.form.controls.bookingPeriod.disable();
              this.form.controls.bookingHours.disable();

              this.form.patchValue({
                projectNumber: null,
                bookingPeriod: null,
                bookingHours: null,
                billable: true,
              });

              this.form.controls.quoteId.enable();
              this.form.controls.totalHours.enable();
              break;
          }
        },
        error: console.error,
      });

    const selectedClient$ = combineLatest({
      clientId: clientId$,
      clients: this.clients$,
    }).pipe(map((t) => t.clients.find((x) => x.id == t.clientId)));

    const selectedQuote$ = combineLatest({
      quoteId: quoteId$,
      quotes: this.quotes$,
    }).pipe(map((t) => t.quotes.find((x) => x.id == t.quoteId)));

    selectedQuote$
      .pipe(
        filter(() => this.form.value.type == ProjectType.Quote),
        takeUntil(this.destroy),
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (quote) => {
          if (quote) {
            this.form.patchValue({
              name: quote.name,
              status: quote.status,
              clientId: quote.clientId,
            });
          }
        },
        error: console.error,
      });

    selectedClient$
      .pipe(
        filter(() => this.form.value.type == ProjectType.Quote),
        takeUntil(this.destroy),
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (client) => {
          if (client) {
            this.form.controls.hourlyRate.setValue(client.hourlyRate ?? null);
            this.form.controls.quoteId.enable();
          } else {
            this.form.controls.quoteId.disable();
          }
        },
        error: console.error,
      });
  }

  async ngOnInit() {
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    if (clientId) {
      this.form.patchValue({ clientId });
    }

    const quoteId = this.route.snapshot.queryParamMap.get('quoteId');
    if (quoteId) {
      this.form.patchValue({ quoteId, type: ProjectType.Quote });
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
          this.hqService.upsertProjectV1(request),
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
