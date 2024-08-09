import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PsrService } from '../psr-service';

import {
  Observable,
  ReplaySubject,
  combineLatest,
  debounceTime,
  map,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  firstValueFrom,
  filter,
  catchError,
  of,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { APIError } from '../../errors/apierror';
import { HQMarkdownComponent } from '../../common/markdown/markdown.component';
import { ModalService } from '../../services/modal.service';
import { HQRole } from '../../enums/hqrole';
import { InRolePipe } from '../../pipes/in-role.pipe';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { GetPSRRecordV1 } from '../../models/PSR/get-PSR-v1';
import { GetPrevPsrResponseV1 } from '../../models/PSR/get-previous-PSR-v1';
import { ToastService } from '../../services/toast.service';
import { ButtonState } from '../../enums/button-state';
import { PSRTimeListComponent } from '../psrtime-list/psrtime-list.component';
import { AngularSplitModule } from 'angular-split';
import { PsrSearchFilterComponent } from '../psr-search-filter/psr-search-filter.component';
import { PanelComponent } from '../../core/components/panel/panel.component';
import { CoreModule } from '../../core/core.module';

@Component({
  selector: 'hq-psrreport',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MonacoEditorModule,
    HQMarkdownComponent,
    InRolePipe,
    PSRTimeListComponent,
    AngularSplitModule,
    PsrSearchFilterComponent,
    PanelComponent,
    CoreModule,
  ],
  templateUrl: './psrreport.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PSRReportComponent implements OnInit, OnDestroy {
  editorOptions$: Observable<object>;
  report = new FormControl<string | null>(null);
  previousReport: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorInstance: any;
  sideBarCollapsed = false;
  leftWidth: number = 100;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  report$ = this.report.valueChanges;
  psrId$: Observable<string>;
  psr$: Observable<GetPSRRecordV1>;

  savedStatus?: string;

  submitButtonState: ButtonState = ButtonState.Enabled;
  prevPSRReportButtonState: ButtonState = ButtonState.Disabled;

  prevPsr$: Observable<GetPrevPsrResponseV1 | null>;
  ButtonState = ButtonState;
  HQRole = HQRole;
  currentDate = new Date();

  async ngOnInit() {
    this.psrService.resetFilter();
    this.psrService.hideSearch();
    this.psrService.hideStartDate();
    this.psrService.hideEndDate();
    this.psrService.hideStaffMembers();
    this.psrService.hideIsSubmitted();

    const psr = await firstValueFrom(this.psr$);
    const prevPsr = await firstValueFrom(this.prevPsr$);
    if (psr && psr.report) {
      this.report.setValue(psr.report);
    }
    if (prevPsr && prevPsr.report) {
      this.previousReport = prevPsr.report;
    }

    this.submitButtonState =
      psr && (psr.submittedAt || psr.isCurrentPsrPeriod)
        ? ButtonState.Disabled
        : ButtonState.Enabled;

    this.prevPSRReportButtonState =
      prevPsr && prevPsr.report ? ButtonState.Enabled : ButtonState.Disabled;
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
    private oidcSecurityService: OidcSecurityService,
    private toastService: ToastService,
  ) {
    this.psrId$ = this.route.parent!.params.pipe(
      map((params) => params['psrId']),
    );
    this.psr$ = this.psrId$.pipe(
      switchMap((psrId) => this.hqService.getPSRV1({ id: psrId })),
      map((t) => t.records[0]),
    );
    this.prevPsr$ = this.psrId$.pipe(
      switchMap((psrId) =>
        this.hqService.getPrevPSRV1({ projectStatusReportId: psrId }).pipe(
          catchError((error: unknown) => {
            console.error('Error fetching previous PSR:', error);
            return of(null);
          }),
        ),
      ),
    );
    const canManageProjectStatusReport$ = combineLatest({
      userData: oidcSecurityService.userData$.pipe(map((t) => t.userData)),
      psr: this.psr$,
    }).pipe(
      map(
        (t) =>
          t.userData.roles &&
          Array.isArray(t.userData.roles) &&
          (t.userData.roles.includes(HQRole.Administrator) ||
            t.userData.roles.includes(HQRole.Executive) ||
            t.userData.roles.includes(HQRole.Partner) ||
            (t.userData.roles.includes(HQRole.Manager) &&
              t.psr.projectManagerId == t.userData.staff_id)),
      ),
      map((t) => !!t),
    );

    // Editor options
    this.editorOptions$ = canManageProjectStatusReport$.pipe(
      map((canManageProjectStatusReport) => {
        return {
          theme: 'vs-dark',
          language: 'markdown',
          automaticLayout: true,
          readOnly: !canManageProjectStatusReport,
          domReadOnly: !canManageProjectStatusReport,
          wordWrap: 'on',
        };
      }),
      startWith({
        theme: 'vs-dark',
        language: 'markdown',
        readOnly: true,
        domReadOnly: true,
      }),
    );

    const request$ = canManageProjectStatusReport$.pipe(
      filter((canManageProjectStatusReport) => canManageProjectStatusReport),
      switchMap(() =>
        combineLatest({
          projectStatusReportId: this.psrId$,
          report: this.report$.pipe(skip(1)),
        }),
      ),
    );

    request$
      .pipe(
        skip(1),
        debounceTime(1000),
        // tap(() => (this.savedStatus = 'loading')),
        switchMap((request) =>
          this.hqService.updateProjectStatusReportMarkdownV1(request),
        ),
        takeUntil(this.destroyed$),
      )
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe({
        next: () => {
          // this.savedStatus = 'success';
          this.toastService.show('Success', 'PSR Report Saved Successfully');
        },
        error: async () => {
          // this.savedStatus = 'fail';
          this.toastService.show(
            'Error',
            'There was an error saving the PM report.',
          );
          await firstValueFrom(
            this.modalService.alert(
              'Error',
              'There was an error saving the PM report.',
            ),
          );
        },
      });
  }

  insertTextAtCursor() {
    const selection = this.editorInstance.getSelection();
    const id = { major: 1, minor: 1 };
    const op = {
      identifier: id,
      range: selection,
      text: this.previousReport,
      forceMoveMarkers: false,
    };
    this.editorInstance.executeEdits('my-source', [op]);
    this.editorInstance.focus();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorInit(editor: any) {
    this.editorInstance = editor;
  }

  async onReportSubmit() {
    const confirmation = await firstValueFrom(
      this.modalService.confirm(
        'Confirmation',
        'Are you sure you want to submit this report?',
      ),
    );

    if (confirmation) {
      const request$ = combineLatest({ projectStatusReportId: this.psrId$ });

      const apiResponse$ = request$.pipe(
        take(1),
        switchMap((request) =>
          this.hqService.submitProjectStatusReportV1(request),
        ),
      );

      try {
        await firstValueFrom(apiResponse$);

        await firstValueFrom(
          this.modalService.alert('Success', 'Report submitted successfully'),
        );
        await this.router.navigate(['/psr']);
        this.submitButtonState = ButtonState.Disabled;
      } catch (err) {
        if (err instanceof APIError) {
          await firstValueFrom(
            this.modalService.alert('Error', err.errors.join('\n')),
          );
        }
      }
    }
  }
}
