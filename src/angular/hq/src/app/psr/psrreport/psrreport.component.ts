import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import type { editor } from 'monaco-editor';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PsrService } from '../psr-service';
import { PsrPointSummaryListComponent } from '../psr-point-summary-list/psr-point-summary-list.component';
import { PsrRefreshService } from '../Services/psr-refresh.service';

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
import {
  ProjectColorStatus,
  ProjectColorStatusLabels,
} from '../../enums/project-color-status';
import { projectStatusToClass } from '../../common/functions/project-status-to-class';

@Component({
  selector: 'hq-psrreport',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MonacoEditorModule,
    FormsModule,
    HQMarkdownComponent,
    InRolePipe,
    PSRTimeListComponent,
    AngularSplitModule,
    PsrSearchFilterComponent,
    PanelComponent,
    CoreModule,
    PsrPointSummaryListComponent,
  ],
  templateUrl: './psrreport.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class PSRReportComponent implements OnInit, OnDestroy {
  editorOptions$: Observable<editor.IStandaloneEditorConstructionOptions>;
  defaultEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'markdown',
    readOnly: true,
    domReadOnly: true,
  };
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

  projectStatusToClass = projectStatusToClass;
  projectColorStatus = ProjectColorStatus;
  projectColorStatuses = Object.keys(ProjectColorStatusLabels).map((key) => {
    const numericKey = Number(key) as ProjectColorStatus;
    return {
      id: numericKey,
      name: ProjectColorStatus[numericKey],
      displayName: ProjectColorStatusLabels[numericKey],
    };
  });
  colorStatus = new FormControl<ProjectColorStatus | null>(null);

  submitButtonState: ButtonState = ButtonState.Enabled;
  prevPSRReportButtonState: ButtonState = ButtonState.Disabled;

  prevPsr$: Observable<GetPrevPsrResponseV1 | null>;
  ButtonState = ButtonState;
  HQRole = HQRole;
  currentDate = new Date();

  togglePreview: boolean = false;

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

    const currentColorStatus = this.projectColorStatuses.find(
      (colorStatus) => colorStatus.id === psr.colorStatus,
    );
    if (currentColorStatus) {
      this.colorStatus.setValue(currentColorStatus.id, { emitEvent: false });
    } else {
      this.colorStatus.setValue(ProjectColorStatus.Gray, { emitEvent: false });
    }
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
    private psrRefreshService: PsrRefreshService,
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
          wordWrap: 'on' as const,
        };
      }),
      startWith({
        theme: 'vs-dark',
        language: 'markdown',
        readOnly: true,
        domReadOnly: true,
      } as editor.IStandaloneEditorConstructionOptions),
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
      // eslint-disable-next-line rxjs-angular-x/prefer-async-pipe
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

    const colorStatus$ = this.colorStatus.valueChanges;
    const updateColorStatusRequest$ = combineLatest({
      projectStatusReportId: this.psrId$,
      projectColorStatus: colorStatus$,
    });
    updateColorStatusRequest$
      .pipe(
        switchMap((request) => {
          return this.hqService.updatePSRColorStatusV1(request);
        }),
        takeUntil(this.destroyed$),
      )
      // eslint-disable-next-line rxjs-angular-x/prefer-async-pipe
      .subscribe({
        next: () => {
          this.toastService.show(
            'Success',
            'Project Report Status successfully updated.',
          );
          this.psrRefreshService.triggerRefresh();
        },
        error: console.error,
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

        this.toastService.show('Success', 'Report submitted successfully');

        await this.router.navigate(['/psr']);
        this.submitButtonState = ButtonState.Disabled;
      } catch (err) {
        if (err instanceof APIError) {
          this.toastService.show('Error', err.errors.join('\n'));
        }
      }
    }
  }
}
