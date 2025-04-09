import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, catchError, combineLatest, debounceTime, filter, map, merge, Observable, of, ReplaySubject, shareReplay, startWith, Subject, switchMap, takeUntil, takeWhile, tap } from "rxjs";
import { HQService } from "../../services/hq.service";
import { SortColumn as staffSortColumn } from '../../models/staff-members/get-staff-member-v1';
import { GetInvoicesRecordV1 } from "../../models/Invoices/get-invoices-v1";
import { GetClientRecordV1 } from "../../models/clients/get-client-v1";
import { GetChargeCodeRecordV1 } from "../../models/charge-codes/get-chargecodes-v1";
import { GetInvoiceDetailsRecordV1 } from "../../models/Invoices/get-invoice-details-v1";
import { BaseListService } from "../../core/services/base-list.service";
import { GetTimeRecordStaffV1, GetTimeRecordsV1, GetTimeRecordV1, SortColumn } from "../../models/times/get-time-v1";
import { SortDirection } from "../../models/common/sort-direction";
import { GetProjectRecordV1 } from "../../models/projects/get-project-v1";
import { Period } from "../../enums/period";
import { TimeStatus } from "../../enums/time-status";
import { FormControl } from "@angular/forms";
import { GetProjectActivityRecordV1 } from "../../models/projects/get-project-activity-v1";

@Injectable({
  providedIn: 'root',
})
export class InvoiceDetaisService extends BaseListService<
  GetTimeRecordsV1,
  GetTimeRecordV1,
  SortColumn
> {
  private invoiceRefreshSubject = new Subject<void>();
  private invoiceIdSubject$ = new BehaviorSubject<string | null>(null);
  invoiceId$: Observable<string>;
  invoice$: Observable<GetInvoiceDetailsRecordV1>;
  invoiced$ = new BehaviorSubject<boolean | null>(null);

  clientId$: Observable<string>;
  
  client$: Observable<GetClientRecordV1>;
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;
  staffMembers$: Observable<GetTimeRecordStaffV1[]>;
  projects$: Observable<GetProjectRecordV1[]>;
  activities$: Observable<GetProjectActivityRecordV1[]>;
  invoiceTimes$: Observable<GetTimeRecordV1[]>;

  showProjectStatus$ = new BehaviorSubject<boolean>(true);
  showSearch$ = new BehaviorSubject<boolean>(true);
  showStaffMembers$ = new BehaviorSubject<boolean>(true);
  showProjectActivities$ = new BehaviorSubject<boolean>(true);

  showStartDate$ = new BehaviorSubject<boolean>(false);
  showEndDate$ = new BehaviorSubject<boolean>(false);

  showRoaster$ = new BehaviorSubject<boolean>(true);

  roaster = new FormControl<string | null>('');
  
  staffMember = new FormControl<string | null>(null);
  client = new FormControl<string | null>(null);
  project = new FormControl<string | null>(null);
  selectedPeriod = new FormControl<Period | null>(Period.Month);

  projectActivity = new FormControl<string | null>(null);
  isSubmitted = new FormControl<boolean | null>(null);
  // invoiced = new FormControl<boolean | null>(null);
  timeStatus = new FormControl<TimeStatus | null>(null);
  billable = new FormControl<boolean | null>(null);

  startDate = new FormControl<Date | null>(null);
  endDate = new FormControl<Date | null>(null);

  Period = Period;
  Status = TimeStatus;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private hqService: HQService) {
    super(SortColumn.Date, SortDirection.Desc);
    const invoiceId$ = this.invoiceIdSubject$.asObservable().pipe(
      filter((invoiceId) => invoiceId != null),
      map((invoiceId) => invoiceId!),
    );
    
    const refreshInvoiceId$ = this.invoiceRefreshSubject.pipe(
      switchMap(() => this.invoiceId$),
    )

    this.invoiceId$ = merge(invoiceId$, refreshInvoiceId$);

    this.invoice$ = this.invoiceId$.pipe(
      switchMap((invoiceId) => this.hqService.getInvoiceDetailsV1({ id: invoiceId})),
      tap((t) => console.log("invoice:",t)),
      shareReplay({ bufferSize: 1, refCount: false}),
    );

    this.clientId$ = this.invoice$.pipe(map(invoice => invoice.clientId));

    this.client$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getClientsV1({ id: clientId })),
      map((t) => t.records[0]),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.chargeCodes$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getChargeCodeseV1({ clientId: clientId })),
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false}),
    );

    this.invoiceTimes$ = this.invoiceId$.pipe(
      switchMap((invoiceId) => this.hqService.getTimesV1({ invoiceId: invoiceId})),
      map((t) => t.records),
      shareReplay({bufferSize: 1, refCount: false}),
    );

    this.staffMembers$ = this.hqService
      .getStaffMembersV1({
        sortBy: staffSortColumn.Name,
      })
      .pipe(map((members) => members.records));

    const projectRequest$ = combineLatest({
          clientId: this.clientId$,
        });
    
    this.projects$ = projectRequest$.pipe(
      switchMap((projectRequest) =>
        this.hqService.getProjectsV1(projectRequest),
      ),
      map((clients) => clients.records),
    );

    this.activities$ = this.project.valueChanges.pipe(takeWhile((p) => p != null),
      switchMap((p) => { 
        // if(p != null){
          return this.hqService.getprojectActivitiesV1({ projectId: p })
        // } else {
        //   return null;
        // }
      }),
      map((activities) => activities.records)
    )

    this.showStartDate$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (showStart) => {
        if (!showStart) {
          this.startDate.setValue(null);
        }
      },
      error: console.error,
    });
    this.showEndDate$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (showEnd) => {
        if (!showEnd) {
          this.endDate.setValue(null);
        }
      },
      error: console.error,
    });

    
  }

  showStartDate() {
    this.showStartDate$.next(true);
  }
  hideStartDate() {
    this.showStartDate$.next(false);
  }
  showEndDate() {
    this.showEndDate$.next(true);
  }
  hideEndDate() {
    this.showEndDate$.next(false);
  }

  getInvoiceId() {
    return this.invoiceIdSubject$.getValue();
  }

  setInvoiceId(invoiceId?: string | null) {
    if(invoiceId) {
      this.invoiceIdSubject$.next(invoiceId);
    }
  }

  protected override getResponse(): Observable<GetTimeRecordsV1> {
      const projectId$ = this.project.valueChanges.pipe(
        startWith(this.project.value),
      );
      const activityId$ = this.projectActivity.valueChanges.pipe(
        startWith(null),
      )
      const staffMemberId$ = this.staffMember.valueChanges.pipe(
        startWith(this.staffMember.value),
      );
      const startDate$ = this.startDate.valueChanges.pipe(
        startWith(this.startDate.value),
      );
      const endDate$ = this.endDate.valueChanges.pipe(
        startWith(this.endDate.value),
      );
      const periodFilter$ = this.selectedPeriod.valueChanges.pipe(
        startWith(this.selectedPeriod.value),
      );

      const period$: Observable<Period | null> = combineLatest([this.invoiced$, periodFilter$]).pipe(
        map(([b, p]): Period | null => {
          if(b){
            console.log("  none")
            return null;
          } else {
            console.log("  ", p)
            return p;
          }
        }),
      );

      // const invoiced$ = this.invoiced.valueChanges.pipe(
      //   startWith(this.invoiced.value),
      // );
      const timeStatus$ = this.timeStatus.valueChanges.pipe(
        startWith(this.timeStatus.value),
      );
      const billable$ = this.billable.valueChanges.pipe(
        startWith(this.billable.value),
      );

      const invoiceId$ = combineLatest([this.invoiced$, this.invoiceId$]).pipe(map((b) => {
        if(b[0]){ 
          console.log("Invoice id returned", b[1])
          return b[1];
        } else {
          console.log("Null returned")
          return null;
        }
      }))

      const combinedParams = {
        search: this.search$,
        skip: this.skip$,
        clientId: this.clientId$,
        projectId: projectId$,
        staffId: staffMemberId$,
        sortBy: this.sortOption$,
        invoiceId: invoiceId$,
        invoiced: this.invoiced$,
        startDate: startDate$,
        endDate: endDate$,
        period: period$,
        timeStatus: timeStatus$,
        sortDirection: this.sortDirection$,
        billable: billable$,
        activityId: activityId$
      };

      return combineLatest(combinedParams).pipe(
        debounceTime(500),
        tap(() => this.loadingSubject.next(true)),
        switchMap((request) => 
          this.hqService.getTimesV1(request).pipe(
            catchError((error: any) => {
              this.loadingSubject.next(false);
              console.error('Error fetching Invoice Time records', error);
              return of(error);
            }),
          ),
        ),
        tap(() => this.loadingSubject.next(false)),
      );
    }

  invoiceRefresh() {
    this.invoiceRefreshSubject.next();
  }
}