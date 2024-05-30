import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PsrService } from '../psr-service';

@Component({
  selector: 'hq-psrreport',
  standalone: true,
  imports: [ FormsModule, CommonModule, MonacoEditorModule],
  templateUrl: './psrreport.component.html',
})
export class PSRReportComponent {
  constructor(psrService: PsrService) {
    psrService.hideSearch();
    psrService.hideStaffMembers();
  }
  editorOptions = { theme: 'vs-dark', language: 'markdown' };
  code: string = '';
}
