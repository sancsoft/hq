import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  GetDashboardTimeV1Project,
  GetDashboardTimeV1ProjectActivity,
  GetDashboardTimeV1TimeForDateTimes,
} from '../../models/staff-dashboard/get-dashboard-time-v1';
import { StaffDashboardService } from '../staff-dashboard.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  shareReplay,
  skip,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { roundToNextQuarter } from '../../common/functions/round-to-next-quarter';

export interface HQTimeChangeEvent {
  id?: string | null;
  date?: string | null;
  hours?: number | null;
  notes?: string | null;
  task?: string | null;
  chargeCode?: string | null;
  chargeCodeId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  activityId?: string | null;
}

interface Form {
  id: FormControl<string | null>;
  date: FormControl<string | null>;
  hours: FormControl<number | null>;
  notes: FormControl<string | null>;
  task: FormControl<string | null>;
  chargeCode: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  clientId: FormControl<string | null>;
  projectId: FormControl<string | null>;
  activityId: FormControl<string | null>;
}

@Component({
  selector: 'tr[hq-staff-dashboard-time-entry]',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-dashboard-time-entry.component.html',
})
export class StaffDashboardTimeEntryComponent implements OnChanges, OnDestroy {
  @Input()
  time?: Partial<GetDashboardTimeV1TimeForDateTimes>;

  @Output()
  hqTimeChange = new EventEmitter<HQTimeChangeEvent>();

  @HostBinding('class')
  class = 'even:bg-gray-850 odd:bg-black-alt';

  private destroyed$ = new Subject<void>();

  form = new FormGroup<Form>({
    id: new FormControl<string | null>(null),
    date: new FormControl<string | null>(null, [Validators.required]),
    hours: new FormControl<number | null>(null, [Validators.required]),
    notes: new FormControl<string | null>(null, [Validators.required]),
    task: new FormControl<string | null>(null),
    chargeCode: new FormControl<string | null>(null),
    chargeCodeId: new FormControl<string | null>(null, [Validators.required]),
    clientId: new FormControl<string | null>(null),
    projectId: new FormControl<string | null>(null),
    activityId: new FormControl<string | null>(null),
  });

  projects$: Observable<GetDashboardTimeV1Project[]>;
  activities$: Observable<GetDashboardTimeV1ProjectActivity[]>;

  constructor(public staffDashboardService: StaffDashboardService) {
    const form$ = this.form.valueChanges.pipe(shareReplay(1));

    const clientId$ = form$.pipe(
      map((t) => t.clientId),
      distinctUntilChanged(),
    );

    const projectId$ = form$.pipe(
      map((t) => t.projectId),
      distinctUntilChanged(),
    );

    const hours$ = form$.pipe(
      map((t) => t.hours),
      distinctUntilChanged(),
    );

    const client$ = combineLatest({
      clientId: clientId$,
      clients: staffDashboardService.clients$,
    }).pipe(map((t) => t.clients.find((x) => x.id == t.clientId)));

    this.projects$ = client$.pipe(map((t) => t?.projects ?? []));

    const project$ = combineLatest({
      projectId: projectId$,
      client: client$,
    }).pipe(map((t) => t.client?.projects?.find((x) => x.id == t.projectId)));

    this.activities$ = project$.pipe(
      map((t) => t?.activities ?? []),
      startWith([]),
    );

    clientId$
      .pipe(pairwise(), takeUntil(this.destroyed$))
      .subscribe(([previousClientId, currentClientId]) => {
        if (currentClientId != previousClientId) {
          this.form.patchValue({
            chargeCodeId: null,
            chargeCode: null,
            projectId: null,
          });
        }
      });

    project$.pipe(takeUntil(this.destroyed$)).subscribe((project) => {
      if (project) {
        this.form.patchValue({
          chargeCodeId: project.chargeCodeId,
          chargeCode: project.chargeCode,
        });
      }
    });

    hours$
      .pipe(debounceTime(500), takeUntil(this.destroyed$))
      .subscribe((hours) => {
        if (hours != null) {
          this.form.patchValue({ hours: roundToNextQuarter(hours) });
        }
      });

    form$
      .pipe(takeUntil(this.destroyed$), debounceTime(750))
      .subscribe((time) => {
        if (this.form.touched) {
          this.class = this.form.invalid
            ? 'bg-red-850'
            : 'even:bg-gray-850 odd:bg-black-alt';

          if (this.form.valid) {
            this.hqTimeChange.emit(time);
          }
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['time'].currentValue) {
      this.form.patchValue(changes['time'].currentValue);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}