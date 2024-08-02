import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';
import { ProjectStatus } from '../../enums/project-status';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { HQService } from '../../services/hq.service';
import { GetClientInvoiceSummaryV1Response } from '../../models/clients/get-client-invoice-summary-v1';

@Injectable({
  providedIn: 'root',
})
export class ClientDetailsService {
  ProjectStatus = ProjectStatus;

  search = new FormControl<string | null>(null);
  projectStatus = new FormControl<ProjectStatus | null>(null);

  showProjectStatus$: Observable<boolean>;

  clientId$: Observable<string>;
  client$: Observable<GetClientRecordV1>;
  clientInvoiceSummary$: Observable<GetClientInvoiceSummaryV1Response>;

  private showProjectStatusSubject = new BehaviorSubject<boolean>(true);
  private clientIdSubject = new BehaviorSubject<string | null>(null);

  constructor(private hqService: HQService) {
    this.showProjectStatus$ = this.showProjectStatusSubject.asObservable();

    this.clientId$ = this.clientIdSubject.asObservable().pipe(
      filter((clientId) => clientId != null),
      map((clientId) => clientId!),
    );

    this.client$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getClientsV1({ id: clientId })),
      map((t) => t.records[0]),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.clientInvoiceSummary$ = this.clientId$.pipe(
      switchMap((clientId) =>
        this.hqService.getClientInvoiceSummaryV1({ id: clientId }),
      ),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  resetFilters() {
    this.search.reset();
    this.projectStatus.reset();
  }

  showProjectStatus() {
    this.showProjectStatusSubject.next(true);
  }

  hideProjectStatus() {
    this.showProjectStatusSubject.next(false);
  }

  subscribeClientId(clientId$: Observable<string | null>) {
    return clientId$.subscribe({
      next: (clientId) => this.clientIdSubject.next(clientId),
      error: console.error,
    });
  }
}
