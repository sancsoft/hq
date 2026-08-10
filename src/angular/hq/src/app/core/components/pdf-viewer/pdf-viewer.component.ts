import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PDFDocumentProxy, PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'hq-pdf-viewer',
  imports: [CommonModule, PdfViewerModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pdf-viewer.component.html',
})
export class PdfViewerComponent {
  @Input() pdfURL?: string | null;
  page: number = 1;
  totalPages?: number;
  isLoaded: boolean = false;

  afterLoadComplete(pdfData: PDFDocumentProxy) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
  }

  nextPage() {
    this.page++;
  }

  prevPage() {
    this.page--;
  }
}
