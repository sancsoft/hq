import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  Observable,
  Subject,
  firstValueFrom,
  map,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';
import { CoreModule } from '../../../core/core.module';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { enumToArray } from '../../../core/functions/enum-to-array';
import { formControlChanges } from '../../../core/functions/form-control-changes';
import { Period } from '../../../enums/period';
import { ProjectStatus } from '../../../enums/project-status';
import { ProjectType } from '../../../enums/project-type';
import { APIError } from '../../../errors/apierror';
import { GetClientRecordV1 } from '../../../models/clients/get-client-v1';
import { SortDirection } from '../../../models/common/sort-direction';
import {
  GetQuotesRecordV1,
  SortColumn as QuoteSortColumn,
} from '../../../models/quotes/get-quotes-v1';
import {
  GetStaffV1Record,
  SortColumn,
} from '../../../models/staff-members/get-staff-member-v1';
import { HQService } from '../../../services/hq.service';
import { GetProjectRecordV1 } from '../../../models/projects/get-project-v1';
import { ProjectDetailsService } from '../project-details.service';

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
  timeEntryMaxHours: FormControl<number | null>;
}

@Component({
  selector: 'hq-project-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    CoreModule,
    ReactiveFormsModule,
  ],
  templateUrl: './project-edit.component.html',
})
export class ProjectEditComponent implements OnInit, OnDestroy {
  psrId$: Observable<string | null>;
  projectManagers$: Observable<GetStaffV1Record[]>;
  quotes$: Observable<GetQuotesRecordV1[]>;
  clients$: Observable<GetClientRecordV1[]>;
  project$: Observable<GetProjectRecordV1>;

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
      timeEntryMaxHours: new FormControl(null, [Validators.required]),
      bookingPeriod: new FormControl(Period.Month),
      quoteId: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null),
      endDate: new FormControl(null),
      type: new FormControl(null),
      status: new FormControl(null),
      billable: new FormControl(true, { nonNullable: true }),
      bookingHours: new FormControl(null, [Validators.required]),
      projectNumber: new FormControl(null),
    },
    { validators: this.dateRangeValidator },
  );

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    public projectDetailsService: ProjectDetailsService,
  ) {
    this.form.disable();

    this.psrId$ = route.queryParams.pipe(map((t) => t['psrId']));
    this.project$ = route.parent!.paramMap.pipe(
      map((params) => params.get('projectId')),
      switchMap((projectId) => this.hqService.getProjectsV1({ id: projectId })),
      map((t) => t.records[0]),
    );

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

              this.form.controls.bookingPeriod.enable();
              this.form.controls.bookingHours.enable();
              break;
            case ProjectType.Ongoing:
              this.form.controls.quoteId.disable();
              this.form.controls.totalHours.disable();

              this.form.controls.projectNumber.enable();
              this.form.controls.bookingPeriod.enable();
              this.form.controls.bookingHours.enable();
              break;
            case ProjectType.Quote:
              this.form.controls.projectNumber.disable();
              this.form.controls.bookingPeriod.disable();
              this.form.controls.bookingHours.disable();

              this.form.controls.totalHours.enable();
              break;
          }
        },
        error: console.error,
      });
  }

  async ngOnInit() {
    const project = await firstValueFrom(this.project$);
    this.form.enable();
    this.form.patchValue({
      clientId: project.clientId,
      name: project.name,
      projectManagerId: project.projectManagerId,
      hourlyRate: project.hourlyRate,
      totalHours: project.projectTotalHours,
      bookingPeriod: project.bookingPeriod,
      quoteId: project.quoteId,
      startDate: project.startDate,
      timeEntryMaxHours: project.timeEntryMaxHours,
      endDate: project.endDate,
      type: project.type,
      status: project.projectStatus,
      billable: project.billable,
      bookingHours: project.projectBookingHours,
      projectNumber: project.projectNumber,
    });

    this.form.controls.quoteId.disable();
    this.form.controls.type.disable();
  }

  private destroy = new Subject<void>();

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    const project = await firstValueFrom(this.project$);

    try {
      if (this.form.valid) {
        const request = this.form.getRawValue();
        await firstValueFrom(
          this.hqService.upsertProjectV1({ id: project.id, ...request }),
        );

        this.projectDetailsService.refresh();

        await this.router.navigate(['../'], {
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
