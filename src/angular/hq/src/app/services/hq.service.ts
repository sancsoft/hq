import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetClientRequestV1, GetClientResponseV1 } from '../models/clients/get-client-v1';
import { AppSettingsService } from '../app-settings.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { UpsertClientRequestV1, UpsertClientResponseV1 } from '../models/clients/upsert-client-v1';
import { APIError } from '../errors/apierror';

@Injectable({
  providedIn: 'root'
})
export class HQService {

  constructor(private http: HttpClient, private appSettings: AppSettingsService) { }

  getClientsV1(request: GetClientRequestV1) {
    return this.appSettings.apiUrl$.pipe(
      switchMap(apiUrl => this.http.post<GetClientResponseV1>(`${apiUrl}/v1/Clients/GetClientsV1`, request))
    );
  }

  getClientV1(request:  Partial<GetClientRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap(apiUrl => this.http.post<GetClientResponseV1>(`${apiUrl}/v1/Clients/GetClientsV1`, request))
    );
  }

  upsertClientV1(request: Partial<UpsertClientRequestV1>) {
    return this.appSettings.apiUrl$.pipe(
      switchMap(apiUrl => this.http.post<UpsertClientResponseV1>(`${apiUrl}/v1/Clients/UpsertClientV1`, request)),
      catchError((err: HttpErrorResponse) => {
        if(err.status == 400)
        {
          return throwError(() => new APIError(err.error));
        }

        throw err;
      })
    );
  }

}
