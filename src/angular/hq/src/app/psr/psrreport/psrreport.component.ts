import { HQService } from './../../services/hq.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PsrService } from '../psr-service';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  map,
  switchMap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private hqService: HQService,
    private route: ActivatedRoute,
    psrService: PsrService
  ) {
    psrService.hideSearch();
    psrService.hideStaffMembers();

    const psrId$ = this.route.parent!.params.pipe(
      map((params) => params['psrId'])
    );
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
    // this.report$.subscribe((response => console.log(response)));
    // psrId$.subscribe((response => console.log(response)));
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
}
