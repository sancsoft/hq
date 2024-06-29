import { Pipe, PipeTransform, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HQRole } from '../enums/hqrole';
import { Observable, map } from 'rxjs';

@Pipe({
  name: 'inRole',
  standalone: true,
})
export class InRolePipe implements PipeTransform {
  oidcSecurityService = inject(OidcSecurityService);

  transform(roles: HQRole | HQRole[]): Observable<boolean> {
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return this.oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map(
        (t) =>
          t &&
          t.roles &&
          Array.isArray(t.roles) &&
          rolesToCheck.some((role) => t.roles.includes(role)),
      ),
    );
  }
}
