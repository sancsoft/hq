import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, map, startWith, combineLatest, switchMap, of, catchError } from 'rxjs';
import { APIError } from '../../../errors/apierror';
import { GetQuotesRecordV1, QuoteStatus } from '../../../models/quotes/get-quotes-v1';
import { HQService } from '../../../services/hq.service';
import { GetServicesRecordV1, GetServicesRecordsV1 } from '../../../models/Services/get-services-v1';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { ClientDetailsService } from '../../client-details.service';

@Component({
  selector: 'hq-client-service-list',
  standalone: true,
  imports: [RouterLink, CommonModule, PaginatorComponent, ReactiveFormsModule],
  templateUrl: './client-service-list.component.html'
})
export class ClientServiceListComponent implements OnInit {
  clientId?: string;
  services$ = new BehaviorSubject<GetServicesRecordV1[]>([]);
  apiErrors: string[] = [];

  itemsPerPage = new FormControl(10, { nonNullable: true });

  page = new FormControl<number>(1, { nonNullable: true });


  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number> = this.services$.pipe(map(services => services.length));

  constructor(private hqService: HQService, private route: ActivatedRoute, private clientDetailService: ClientDetailsService) {
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

    this.clientDetailService.resetFilters();
    this.clientDetailService.hideProjectStatus();
    this.clientDetailService.hideCurrentOnly();
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
        return this.getClientServices();
      }),
      catchError(error => {
        if (error instanceof APIError) {
          this.apiErrors = error.errors;
        } else {
          this.apiErrors = ['An unexpected error has occurred.'];
        }
        return of([]);
      })
    ).subscribe(services => {
      console.log(services);
      this.services$.next(services)
    });
  }

  private getClientServices(): Observable<GetServicesRecordV1[]> {
    const request = { clientId: this.clientId };
    return this.hqService.getServicesV1(request).pipe(
      map(response => response.records),
      catchError(error => {
        throw error;
      })
    );
  }

  getQuoteStatusString(status: QuoteStatus): string {
    return QuoteStatus[status];
}

  goToPage(page: number) {
    this.page.setValue(page);
  }
}
