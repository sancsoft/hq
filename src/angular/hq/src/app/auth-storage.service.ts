import { Injectable } from '@angular/core';
import { AbstractSecurityStorage } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService implements AbstractSecurityStorage {
  read(key: string) {
    return localStorage.getItem(key);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  write(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
  clear() {
    localStorage.clear();
  }
}
