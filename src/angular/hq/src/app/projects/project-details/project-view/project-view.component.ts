import { HQService } from '../../../services/hq.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  Observable,
  Subject,
  map,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';
import { PdfViewerComponent } from '../../../core/components/pdf-viewer/pdf-viewer.component';
import { Period } from '../../../enums/period';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { enumToArray } from '../../../core/functions/enum-to-array';
import { formControlChanges } from '../../../core/functions/form-control-changes';
import { ProjectStatus } from '../../../enums/project-status';
import { ProjectType } from '../../../enums/project-type';
import { GetClientRecordV1 } from '../../../models/clients/get-client-v1';
import { SortDirection } from '../../../models/common/sort-direction';
import {
  GetQuotesRecordV1,
  SortColumn as QuoteSortColumn,
} from '../../../models/quotes/get-quotes-v1';
import { GetStaffV1Record } from '../../../models/staff-members/get-staff-member-v1';
import { CoreModule } from '../../../core/core.module';
import { ProjectDetailsService } from '../project-details.service';
import { HQRole } from '../../../enums/hqrole';
import { InRolePipe } from '../../../pipes/in-role.pipe';

interface Form {
  clientId: FormControl<string | null>;
  projectManagerId: FormControl<string | null>;
  name: FormControl<string | null>;
  quoteId: FormControl<string | null>;
  hourlyRate: FormControl<number | null>;
  bookingHours: FormControl<number | null>;
  bookingPeriod: FormControl<Period | null>;
  timeEntryMaxHours: FormControl<number | null>;
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
  selector: 'hq-project-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    PdfViewerComponent,
    CoreModule,
    ReactiveFormsModule,
    InRolePipe,
  ],
  templateUrl: './project-view.component.html',
})
export class ProjectViewComponent implements OnDestroy {
  projectManagers$: Observable<GetStaffV1Record[]>;
  quotes$: Observable<GetQuotesRecordV1[]>;
  clients$: Observable<GetClientRecordV1[]>;
  private destroy$ = new Subject<void>();

  HQRole = HQRole;

  public projectStatusValues = enumToArray(ProjectStatus);
  public projectTypeValues = enumToArray(ProjectType);
  public bookingPeriodValues = enumToArray(Period, [
    Period.None,
    Period.Month,
    Period.Quarter,
    Period.Year,
  ]);

  apiErrors: string[] = [];

  form = new FormGroup<Form>({
    clientId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    projectManagerId: new FormControl(null, [Validators.required]),
    hourlyRate: new FormControl(null, [Validators.required]),
    totalHours: new FormControl(null, [Validators.required]),
    timeEntryMaxHours: new FormControl(null, [Validators.required]),
    bookingPeriod: new FormControl(Period.Month),
    quoteId: new FormControl(null, [Validators.required]),
    startDate: new FormControl(null, Validators.required),
    endDate: new FormControl(null),
    type: new FormControl(null),
    status: new FormControl(null),
    billable: new FormControl(true, { nonNullable: true }),
    bookingHours: new FormControl(null, [Validators.required]),
    projectNumber: new FormControl(null),
    requireTask: new FormControl(false),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    public projectDetailService: ProjectDetailsService,
  ) {
    this.projectManagers$ = this.hqService.getStaffMembersV1({}).pipe(
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.clients$ = this.hqService.getClientsV1({}).pipe(
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const clientId$ = formControlChanges(this.form.controls.clientId);

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
    this.projectDetailService.project$
      .pipe(takeUntil(this.destroy$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: (project) => {
          this.form.patchValue({
            clientId: project.clientId,
            name: project.name,
            projectManagerId: project.projectManagerId,
            hourlyRate: project.hourlyRate,
            totalHours: project.projectTotalHours,
            bookingPeriod: project.bookingPeriod,
            timeEntryMaxHours: project.timeEntryMaxHours,
            quoteId: project.quoteId,
            startDate: project.startDate,
            endDate: project.endDate,
            type: project.type,
            status: project.projectStatus,
            billable: project.billable,
            bookingHours: project.projectBookingHours,
            projectNumber: project.projectNumber,
            requireTask: project.requireTask,
          });
        },
        error: console.error,
      });

    this.form.disable();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
