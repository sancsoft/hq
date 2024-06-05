import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, tap } from 'rxjs';
import { HQRole } from '../enums/hqrole';

export function userRoleGuard (role: HQRole, redirect: string = '/'): CanActivateFn {
  return () => {
    const oidcSecurityService = inject(OidcSecurityService);
    const router: Router = inject(Router);
  
    return oidcSecurityService.userData$.pipe(
      map(t => t.userData),
      map(t => t && t.roles && Array.isArray(t.roles) && t.roles.includes(role)),
      map(t => t ? true : router.createUrlTree([redirect]))
    );
  };
}