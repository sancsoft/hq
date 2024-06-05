import { Pipe, PipeTransform, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HQRole } from '../enums/hqrole';
import { Observable, map, tap } from 'rxjs';

@Pipe({
  name: 'inRole',
  standalone: true
})
export class InRolePipe implements PipeTransform {

  oidcSecurityService = inject(OidcSecurityService);

  transform(role: HQRole): Observable<boolean> {
    console.log('checking if user in role ', role)
    return this.oidcSecurityService.userData$.pipe(
      map(t => t.userData),
      map(t => t && t.roles && Array.isArray(t.roles) && t.roles.includes(role)),
    );
  }

}
