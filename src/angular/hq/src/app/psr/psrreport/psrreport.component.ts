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
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { APIError } from '../../errors/apierror';
import { MarkdownModule } from 'ngx-markdown';
import { HQMarkdownComponent } from '../../common/markdown/markdown.component';

@Component({
  selector: 'hq-psrreport',
  standalone: true,
  imports: [FormsModule, CommonModule, MonacoEditorModule, MarkdownModule, HQMarkdownComponent],
  styleUrl: "../../common/markdown/markdown.component.css",
  templateUrl: './psrreport.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PSRReportComponent implements OnInit, OnDestroy {
  editorOptions$: Observable<any>;
  code: string = '';
  sideBarCollapsed = false;
  leftWidth: number = 100;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  report$ = new Subject<string | null>();
  psrId$: Observable<string>;

  ngOnInit(): void {
    this.psrService.resetFilter();
    this.psrService.hideSearch();
    this.psrService.hideStaffMembers();
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
    private psrService: PsrService
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
    // Editor options
    this.editorOptions$ = psr$.pipe(
      map((psr) => {
        return {
          theme: 'vs-dark',
          language: 'markdown',
          automaticLayout: true,
          domReadOnly: psr.submittedAt != null,
          readOnly: psr.submittedAt != null,
        };
      }),
      startWith({ theme: 'vs-dark', language: 'markdown' })
    );
    psr$.subscribe((psrResponse) => {
      if (psrResponse.report) {
        this.code = psrResponse.report;
      }
    });

    const apiResponse$ = request$.pipe(
      debounceTime(1000),
      skip(1),
      takeUntil(this.destroyed$),
      switchMap((request) =>
        this.hqService.updateProjectStatusReportMarkdownV1(request)
      )
    );
    apiResponse$.subscribe({
      next: (response) => {
        console.log('API Response:', response);
      },
      error: (err) => {
        console.error('Error:', err);
      },
    });
  }

  updateReport(value: string) {
    this.report$.next(value);
  }
  onReportSubmit() {
    if (window.confirm('Are you sure you want to submit this report?')) {
      const request$ = combineLatest({
        projectStatusReportId: this.psrId$,
      });
      const apiResponse$ = request$.pipe(
        take(1),
        switchMap((request) =>
          this.hqService.submitProjectStatusReportV1(request)
        )
      );
      apiResponse$.subscribe({
        next: (response) => {
          window.alert('Report submitted successfully');
        },
        error: (err) => {
          if (err instanceof APIError) {
            window.alert(err.errors.join('\n'));
          }
        },
      });
    }
  }
}
