import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GetProjectRecordV1 } from '../../../models/projects/get-project-v1';
import { APIError } from '../../../errors/apierror';
import { HQService } from '../../../services/hq.service';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from '../../../common/paginator/paginator.component';
import { ClientDetailsService } from '../../client-details.service';

@Component({
  selector: 'hq-client-project-list',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, PaginatorComponent],
  templateUrl: './client-project-list.component.html'
})
export class ClientProjectListComponent implements OnInit {
  clientId?: string;
  projects$ = new BehaviorSubject<GetProjectRecordV1[]>([]);
  apiErrors: string[] = [];

  itemsPerPage = new FormControl(10, { nonNullable: true });

  page = new FormControl<number>(1, { nonNullable: true });


  skipDisplay$: Observable<number>;
  takeToDisplay$: Observable<number>;
  totalRecords$: Observable<number> = this.projects$.pipe(map(projects => projects.length));

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
    this.clientDetailService.showProjectStatus();
    this.clientDetailService.showCurrentOnly();
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.pipe(
      switchMap(params => {
        this.clientId = params.get('clientId') || undefined;
        if (!this.clientId) {
          this.apiErrors.push('Client ID is undefined. Please ensure you are accessing this page with a valid client ID.');
          return of([]);
        }
        return this.getClientProjects();
      }),
      catchError(error => {
        if (error instanceof APIError) {
          this.apiErrors = error.errors;
        } else {
          this.apiErrors = ['An unexpected error has occurred.'];
        }
        return of([]);
      })
    ).subscribe(projects => this.projects$.next(projects));
  }

  private getClientProjects(): Observable<GetProjectRecordV1[]> {
    const request = { clientId: this.clientId };
    return this.hqService.getProjectsV1(request).pipe(
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
