import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'hq-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent implements OnChanges {
  paginationLength = 5;

  pages: number[] = [];

  totalPages!: number;

  previousPage?: number | null;

  nextPage?: number | null;

  @Input()
  total!: number;

  @Input()
  pageSize!: number;

  @Input()
  currentPage!: number;

  @Output()
  onPage = new EventEmitter<number>();

  showNextPageButton: boolean = false;

  showPreviousPageButton: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    this.updateVisiblePages();
    this.updatePrevNextButtonPages();
  }

  private updateVisiblePages(): void {
    this.totalPages = Math.ceil(this.total / this.pageSize);
    const length = Math.min(this.totalPages, this.paginationLength);

    const startIndex = Math.max(
      Math.min(
        this.currentPage - Math.ceil(length / 2),
        this.totalPages - length,
      ),
      0,
    );

    this.pages = Array.from(
      new Array(length).keys(),
      (item) => item + startIndex + 1,
    );
  }

  private updatePrevNextButtonPages(): void {
    this.previousPage = this.currentPage - 1;
    this.nextPage = this.currentPage + 1;

    this.showNextPageButton = this.currentPage < this.totalPages;

    this.showPreviousPageButton = this.previousPage >= 1;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.onPage.next(this.currentPage);
  }
}
