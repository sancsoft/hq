import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, NgModel } from '@angular/forms';
import { PsrService } from '../psr-service';


import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  debounceTime,
  map,
  tap,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  firstValueFrom
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { APIError } from '../../errors/apierror';
import { MarkdownModule } from 'ngx-markdown';
import { HQMarkdownComponent } from '../../common/markdown/markdown.component';
import { ButtonState } from '../../enums/ButtonState';
import { ModalService } from '../../services/modal.service';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'hq-psrreport',
  standalone: true,
  imports: [FormsModule, CommonModule, MonacoEditorModule, HQMarkdownComponent, InRolePipe],
  templateUrl: './psrreport.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PSRReportComponent implements OnInit, OnDestroy {
  editorOptions$: Observable<any>;
  report: string | null = null;
  sideBarCollapsed = false;
  leftWidth: number = 100;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  report$ = new Subject<string | null>();
  psrId$: Observable<string>;
  savedStatus?: string;

  submitButtonState: ButtonState = ButtonState.Enabled;
  ButtonState = ButtonState;
  HQRole = HQRole;



  ngOnInit(): void {
    this.psrService.resetFilter();
    this.psrService.hideSearch();
    this.psrService.hideStartDate();
    this.psrService.hideEndDate();
    this.psrService.hideStaffMembers();
    this.psrService.hideIsSubmitted();
  }

  ngOnDestroy(): void {
    this.psrService.resetFilter();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    private psrService: PsrService,
    private modalService: ModalService,
    private oidcSecurityService: OidcSecurityService
  ) {
    const psrId$ = this.route.parent!.params.pipe(
      map((params) => params['psrId'])
    );
    this.psrId$ = psrId$;
    const request$ = combineLatest({
      projectStatusReportId: psrId$,
      report: this.report$,
    });

    const psr$ = psrId$.pipe(
      switchMap((psrId) => this.hqService.getPSRV1({ id: psrId })),
      map((t) => t.records[0])
    );

    const canManageProjectStatusReport$ = combineLatest({
      userData: oidcSecurityService.userData$.pipe(map(t => t.userData)),
      psr: psr$
    }).pipe(
      map(t => t.userData.roles && Array.isArray(t.userData.roles) && (
        t.userData.roles.includes(HQRole.Administrator) ||
        t.userData.roles.includes(HQRole.Executive) ||
        t.userData.roles.includes(HQRole.Partner) ||
        (t.userData.roles.includes(HQRole.Manager) && t.psr.projectManagerId == t.userData.staff_id)
      )),
      map(t => !!t)
    );
    
    // Editor options
    this.editorOptions$ = canManageProjectStatusReport$.pipe(
      map((canManageProjectStatusReport) => {
        return {
          theme: 'vs-dark',
          language: 'markdown',
          automaticLayout: true,
          readOnly: !canManageProjectStatusReport, 
          domReadOnly: !canManageProjectStatusReport
        };
      }),
      startWith({ theme: 'vs-dark', language: 'markdown', readOnly: true, domReadOnly: true })
    );

    psr$.subscribe((psrResponse) => {
      if (psrResponse.report) {
        this.report = psrResponse.report;
      }
      console.log(psrResponse.submittedAt, 'Submitted At');
      this.submitButtonState =  psrResponse.submittedAt ? ButtonState.Disabled : ButtonState.Enabled; // If submittedAt is not null, this means that the report has been submitted
      console.log(this.submitButtonState.toLocaleString()); // console
    });

    const apiResponse$ = request$.pipe(
      skip(1),
      tap(()=> {this.submitButtonState = ButtonState.Enabled}),
      debounceTime(1000),
      takeUntil(this.destroyed$),
      tap(()=> {this.savedStatus = "loading";}),
      switchMap((request) =>
        this.hqService.updateProjectStatusReportMarkdownV1(request)
      )
    );
    apiResponse$.subscribe({
      next: (response) => {
        this.savedStatus ="success";
        console.log('API Response:', response);
      },
      error: (err) => {
        this.savedStatus = "fail";
        console.error('Error:', err);
        this.modalService.alert('Error', 'There was an error saving the PM report.')
        this.savedStatus = "fail";
      },
    });
  }

  updateReport(value: string) {
    this.report$.next(value);
  }

  async onReportSubmit() {
    const confirmation = await firstValueFrom(this.modalService.confirm('Confirmation', 'Are you sure you want to submit this report?'));

    if (confirmation) {
      const request$ = combineLatest({ projectStatusReportId: this.psrId$, });

      const apiResponse$ = request$.pipe(
        take(1),
        switchMap((request) =>
          this.hqService.submitProjectStatusReportV1(request)
        )
      );
      apiResponse$.subscribe({
        next: () => {
          this.modalService.alert('Success', 'Report submitted successfully');
          this.router.navigate(['/psr']);
          this.submitButtonState = ButtonState.Disabled;
        },
        error: (err) => {
          if (err instanceof APIError) {
            this.modalService.alert('Error', err.errors.join('\n'));
          }
        },
      });
    }
  }
}
