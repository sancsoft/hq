import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, BehaviorSubject, map, firstValueFrom } from 'rxjs';
import { APIError } from '../../errors/apierror';
import { ChargeCodeActivity, GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { GetQuotesRecordV1 } from '../../models/quotes/get-quotes-v1';
import { GetServicesRecordV1 } from '../../models/Services/get-services-v1';
import { HQService } from '../../services/hq.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from '../../errors/error-display/error-display.component';
import { GetTimeRecordClientsV1, GetTimeRecordProjectsV1 } from '../../models/times/get-time-v1';
import { OidcSecurityService } from 'angular-auth-oidc-client';


interface Form {
  ProjectId: FormControl<string | null>;
  ClientId: FormControl<string | null>;
  Hours: FormControl<number | null>;
  ActivityId: FormControl<string | null>;
  ChargeCode: FormControl<string | null>;
  Date: FormControl<Date | null>;
  Task: FormControl<string | null>;
  Notes: FormControl<string | null>;
}

@Component({
  selector: 'hq-time-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorDisplayComponent, RouterLink, RouterLinkActive],

  templateUrl: './time-edit.component.html'
})

export class TimeEditComponent {
  apiErrors: string[] = [];
  ChargeCodeActivity = ChargeCodeActivity;
  
  projects$: Observable<GetTimeRecordProjectsV1[]>;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;

  clients$: Observable<GetTimeRecordClientsV1[]>;
  timeId?: string;

  showProjects$ = new BehaviorSubject<boolean | null>(null);
  showQuotes$ = new BehaviorSubject<boolean | null>(null);
  showServices$ = new BehaviorSubject<boolean | null>(null);

 form = new FormGroup<Form>({
  ProjectId: new FormControl<string | null>(null, {
    validators: [],
  }),
  ClientId: new FormControl<string | null>(null, {
    validators: [],
  }),

   ChargeCode: new FormControl<string | null>(null, {
    validators: [],
  }),

  Hours: new FormControl<number | null>(null, {
    validators: [],
  }),
  Date: new FormControl<Date | null>(null, {
    validators: [],
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
});
    async ngOnInit() {
    this.timeId = await (await firstValueFrom(this.route.paramMap.pipe())).get('timeId') ?? undefined
    this.getTime();
  }

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private oidcSecurityService: OidcSecurityService
  ) {
    const projectsResponse$ = this.hqService.getProjectsV1({});
    this.projects$ = projectsResponse$.pipe(
      map((response) => {
        return response.records;
      }));

      const clientsResponse$ = this.hqService.getClientsV1({});
    this.clients$ = clientsResponse$.pipe(
      map((response) => {
        return response.records;
      }));

      const chargeCodes$ = this.hqService.getChargeCodeseV1({});
    this.chargeCodes$ = chargeCodes$.pipe(
      map((response) => {
        return response.records;
      }));
  }
  

  async submit() {
    this.form.markAsTouched();
    console.log(this.form.value);
    if (this.form.invalid) {
      this.apiErrors = [];
      this.apiErrors = ['Invlid Form Error']
      return;
    }
    console.log('Form is valid');

    try {
      const request = this.form.value;
      const response = await firstValueFrom(
        this.hqService.upsertTimeV1({...request, id: this.timeId})
      );
      this.router.navigate(['../../'], { relativeTo: this.route });
    } catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
  updateHours(event: Event) {
    const hours = (event.target as HTMLInputElement).value;
    const roundedHours = this.roundToNextQuarter(hours);
    this.form.get('Hours')?.setValue(roundedHours);
  }
    private async getTime() {
    try {
      const staffId = await firstValueFrom(this.oidcSecurityService.userData$.pipe(
      map(t => t.userData),
      map(t => t.staff_id as string),
    ));
      const request = { "Id": this.timeId, staffId: staffId }
      const response = await firstValueFrom(this.hqService.getTimesV1(request));
      const time = response.records[0]
      this.form.setValue({
       ProjectId: time.projectId ?? null,
       ClientId: time.clientId ?? null,
       Notes: time.description ?? null,
       Hours: time.hours,
       Date: time.date,
       Task: time.task,
       ActivityId: time.activityId,
       ChargeCode: time.chargeCode
      })
    }
    catch (err) {
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
      }
      else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
  roundToNextQuarter(num: string | number) {
    return Math.ceil(Number(num) * 4) / 4;
  }
}