import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'hq-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent implements OnChanges {

  pages: number[] = [];
  
  previousPage? : number | null;
  nextPage? : number | null;

  @Input()
  total?: number;

  @Input()
  pageSize?: number;

  @Input()
  currentPage?: number;

  @Output()
  onPage = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges) {
    if(this.total && this.pageSize && this.currentPage) {
      const totalPages = Math.floor(this.total / this.pageSize);
      this.pages = [];
      for(var i = 0; i < totalPages; i++) {
        this.pages.push(i+1);
      }

      if(this.currentPage > 1) {
        this.previousPage = this.currentPage-1;
      }

      if(this.currentPage < totalPages) {
        this.nextPage = this.currentPage + 1;
      }
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.onPage.next(this.currentPage);
  }

}
