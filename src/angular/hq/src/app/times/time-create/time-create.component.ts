/* eslint-disable rxjs-angular/prefer-async-pipe */
import { Component, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  map,
  firstValueFrom,
  shareReplay,
  Subject,
  takeUntil,
  combineLatest,
} from 'rxjs';
import { APIError } from '../../errors/apierror';
import {
  Activity,
  GetChargeCodeRecordV1,
} from '../../models/charge-codes/get-chargecodes-v1';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import {
  GetTimeRecordClientsV1,
  GetTimeRecordProjectsV1,
} from '../../models/times/get-time-v1';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { roundToNextQuarter } from '../../common/functions/round-to-next-quarter';
import { ChargeCodeActivity } from '../../enums/charge-code-activity';
import { CoreModule } from '../../core/core.module';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';
import { ToastService } from '../../services/toast.service';
import { localISODate } from '../../common/functions/local-iso-date';

interface Form {
  ProjectId: FormControl<string | null>;
  ClientId: FormControl<string | null>;
  Hours: FormControl<number | null>;
  ActivityId: FormControl<string | null>;
  ChargeCode: FormControl<string | null>;
  Date: FormControl<string | null>;
  Task: FormControl<string | null>;
  Notes: FormControl<string | null>;
  StaffId: FormControl<string | null>;
}

@Component({
  selector: 'hq-time-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorDisplayComponent,
    RouterLink,
    RouterLinkActive,
    CoreModule,
  ],

  templateUrl: './time-create.component.html',
})
export class TimeCreateComponent implements OnDestroy {
  apiErrors: string[] = [];
  ChargeCodeActivity = ChargeCodeActivity;

  projects$: Observable<GetTimeRecordProjectsV1[]>;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
  staffMembers$: Observable<GetStaffV1Record[]>;
  activities$: Observable<Activity[] | null>;

  clients$: Observable<GetTimeRecordClientsV1[]>;
  timeId?: string;

  showProjects$ = new BehaviorSubject<boolean | null>(null);
  showQuotes$ = new BehaviorSubject<boolean | null>(null);
  showServices$ = new BehaviorSubject<boolean | null>(null);
  private destroyed$ = new Subject<void>();

  form = new FormGroup<Form>({
    ProjectId: new FormControl<string | null>(null, {
      validators: [],
    }),
    ClientId: new FormControl<string | null>(null, {
      validators: [],
    }),

    ChargeCode: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),

    Hours: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.25)],
    }),
    Date: new FormControl<string | null>(localISODate(), {
      validators: [Validators.required],
    }),

    Task: new FormControl<string | null>(null, {
      validators: [],
    }),
    ActivityId: new FormControl<string | null>(null, {
      validators: [],
    }),
    Notes: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    StaffId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    const projectsResponse$ = this.hqService.getProjectsV1({});
    this.projects$ = projectsResponse$.pipe(
      map((response) => {
        return response.records;
      }),
    );
    this.staffMembers$ = this.hqService.getStaffMembersV1({}).pipe(
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    const clientsResponse$ = this.hqService.getClientsV1({});
    this.clients$ = clientsResponse$.pipe(
      map((response) => {
        return response.records;
      }),
    );

    const chargeCodes$ = this.hqService.getChargeCodeseV1({});
    this.chargeCodes$ = chargeCodes$.pipe(
      map((response) => {
        return response.records;
      }),
    );
    this.activities$ = combineLatest([
      this.chargeCodes$,
      this.form.controls.ChargeCode.valueChanges,
    ]).pipe(
      map(([chargeCodes, code]) => {
        const chargeCode = chargeCodes.find((t) => t.code === code);
        return chargeCode?.activities ?? [];
      }),
      takeUntil(this.destroyed$),
    );
    this.activities$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (v) => {
        this.form.controls.ActivityId.reset();
        this.form.controls.Task.reset();
      },
      error: console.error,
    });

    combineLatest([
      this.chargeCodes$,
      this.form.controls.ChargeCode.valueChanges,
    ])
      .pipe(
        map(([chargeCodes, code]) => {
          const chargeCode = chargeCodes.find((t) => t.code === code);
          return chargeCode?.maximumTimeEntryHours ?? 0;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (maxTimeEntryHours) => {
          this.setMaximumHours(maxTimeEntryHours);
        },
        error: console.error,
      });
  }
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  async submit() {
    this.form.markAllAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error'];
      return;
    }
    console.log('Form is valid');

    try {
      const request = this.form.value;
      await firstValueFrom(
        this.hqService.upsertTimeV1({ ...request, id: null }),
      );
      await this.router.navigate(['../'], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
        this.toastService.show('Error', err.errors.join('\n'));
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
  updateHours(event: Event) {
    const hours = (event.target as HTMLInputElement).value;
    const roundedHours = roundToNextQuarter(hours);
    this.form.get('Hours')?.setValue(roundedHours);
  }

  private setMaximumHours(maxTime?: number): void {
    const maxTimeEntry = maxTime;
    console.log('maxTimeEntry ', maxTimeEntry, maxTime);
    if (maxTimeEntry !== undefined && maxTimeEntry !== null) {
      this.form.controls.Hours.setValidators([
        Validators.required,
        Validators.min(0.25),
        Validators.max(maxTimeEntry),
      ]);
      this.form.controls.Hours.updateValueAndValidity();
    }
  }
  // private async getTime() {
  //   try {
  //     const request = { Id: this.timeId };
  //     const response = await firstValueFrom(this.hqService.getTimesV1(request));
  //     const time = response.records[0];
  //     this.form.setValue({
  //       ProjectId: time.projectId ?? null,
  //       ClientId: time.clientId ?? null,
  //       Notes: time.description ?? null,
  //       Hours: time.hours,
  //       Date: time.date,
  //       Task: time.task,
  //       ActivityId: time.activityId,
  //       ChargeCode: time.chargeCode,
  //     });
  //   } catch (err) {
  //     if (err instanceof APIError) {
  //       this.apiErrors = err.errors;
  //     } else {
  //       this.apiErrors = ['An unexpected error has occurred.'];
  //     }
  //   }
  // }
}
