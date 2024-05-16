import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, map, startWith, combineLatest, switchMap, of, catchError } from 'rxjs';
import { APIError } from '../../../errors/apierror';
import { GetProjectRecordV1 } from '../../../models/projects/get-project-v1';
import { HQService } from '../../../services/hq.service';
import { GetQuotesRecordV1, GetQuotesRecordsV1 } from '../../../models/quotes/get-quotes-v1';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';

@Component({
  selector: 'hq-client-quote-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, PaginatorComponent],
  templateUrl: './client-quote-list.component.html'
})
export class ClientQuoteListComponent implements OnInit {
  clientId?: string;
  quotes$ = new BehaviorSubject<GetQuotesRecordV1[]>([]);
  apiErrors: string[] = [];

  itemsPerPage = new FormControl(10, { nonNullable: true });

  page = new FormControl<number>(1, { nonNullable: true });


  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number> = this.quotes$.pipe(map(quotes => quotes.length));

  constructor(private hqService: HQService, private route: ActivatedRoute) {
    const itemsPerPage$ = this.itemsPerPage.valueChanges.pipe(startWith(this.itemsPerPage.value));
    const page$ = this.page.valueChanges.pipe(startWith(this.page.value));

    const skip$ = combineLatest([itemsPerPage$, page$]).pipe(
      map(([itemsPerPage, page]) => (page - 1) * itemsPerPage),
      startWith(0)
    );

    this.skipDisplay$ = skip$.pipe(map(skip => skip + 1));

    this.takeToDisplay$ = combineLatest([skip$, itemsPerPage$, this.totalRecords$]).pipe(
      map(([skip, itemsPerPage, totalRecords]) => Math.min(skip + itemsPerPage, totalRecords))
    );
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.pipe(
      switchMap(params => {
        this.clientId = params.get('clientId') || undefined;
        console.log(this.clientId);
        if (!this.clientId) {
          this.apiErrors.push('Client ID is undefined. Please ensure you are accessing this page with a valid client ID.');
          return of([]);
        }
        return this.getClientQuotes();
      }),
      catchError(error => {
        if (error instanceof APIError) {
          this.apiErrors = error.errors;
        } else {
          this.apiErrors = ['An unexpected error has occurred.'];
        }
        return of([]);
      })
    ).subscribe(quotes => {
      console.log(quotes);
      this.quotes$.next(quotes)
    });
  }

  private getClientQuotes(): Observable<GetQuotesRecordV1[]> {
    const request = { clientId: this.clientId };
    return this.hqService.getQuotesV1(request).pipe(
      map(response => response.records),
      catchError(error => {
        throw error;
      })
    );
  }

  goToPage(page: number) {
    this.page.setValue(page);
  }
}
