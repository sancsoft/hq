import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetClientRequestV1, GetClientResponseV1 } from '../models/clients/get-client-v1';
import { AppSettingsService } from '../app-settings.service';
import { switchMap } from 'rxjs';

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

}
