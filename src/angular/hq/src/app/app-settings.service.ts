import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

export interface AppSettings {
  apiUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  appSettings$: Observable<AppSettings>;
  apiUrl$: Observable<string>;

  constructor(httpClient: HttpClient) {
    this.appSettings$ = httpClient.get<AppSettings>('/config/settings.json').pipe(shareReplay(1));
    this.apiUrl$ = this.appSettings$.pipe(map(t => t.apiUrl));
  }

}
