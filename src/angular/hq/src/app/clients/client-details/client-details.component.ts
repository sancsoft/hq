import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { firstValueFrom, switchMap, of, Observable, catchError, map } from 'rxjs';
import { HQService } from '../../services/hq.service';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { APIError } from '../../errors/apierror';

@Component({
  selector: 'hq-client-details',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-details.component.html'
})
export class ClientDetailsComponent implements OnInit {
  clientId?: string;
  client?: GetClientRecordV1;
  apiErrors: string[] = [];

  async ngOnInit(): Promise<void> {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.clientId = params.get('clientId') || undefined;
        return this.getClient().pipe(
          catchError(error => {
            if (error instanceof APIError) {
              this.apiErrors = error.errors;
            } else {
              this.apiErrors = ['An unexpected error has occurred.'];
            }
            return of(null);
          })
        );
      })
    ).subscribe(client => {
      this.client = client ?? undefined;
    });
  }
  constructor(private hqService: HQService, private router: Router, private route: ActivatedRoute) { }


  private getClient(): Observable<GetClientRecordV1> {
    const request = { "id": this.clientId };
    return this.hqService.getClientsV1(request).pipe(
      map(response => response.records[0]),
      catchError(error => {
        throw error;
      })
    );
  }
}
