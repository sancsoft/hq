import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, NgModel } from '@angular/forms';
import { PsrService } from '../psr-service';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  map,
  switchMap,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { APIError } from '../../errors/apierror';

@Component({
  selector: 'hq-psrreport',
  standalone: true,
  imports: [FormsModule, CommonModule, MonacoEditorModule],
  templateUrl: './psrreport.component.html',
})
export class PSRReportComponent {
  // Monaco Editor settings
  editorOptions = { theme: 'vs-dark', language: 'markdown' };
  code: string = '';

  report$ = new Subject<string | null>();
  psrId$: Observable<string>;

  constructor(
    private hqService: HQService,
    private router: Router,
    private route: ActivatedRoute,
    psrService: PsrService
  ) {
    psrService.hideSearch();
    psrService.hideStaffMembers();

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
    psr$.subscribe((psrResponse) => {
      if (psrResponse.report) {
        this.code = psrResponse.report;
      }
    });

    const apiResponse$ = request$.pipe(
      debounceTime(1000),
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
        switchMap((request) =>
          this.hqService.submitProjectStatusReportV1(request)
        )
      );
      apiResponse$.subscribe({
        next: (response) => {
          window.alert("Report submitted successfully")
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
