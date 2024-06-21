import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, tap } from 'rxjs';
import { HQRole } from '../enums/hqrole';

export function userRoleGuard(
  roles: HQRole | HQRole[],
  redirect: string = '/',
): CanActivateFn {
  return () => {
    const oidcSecurityService = inject(OidcSecurityService);
    const router: Router = inject(Router);
    const rolesToCheck = Array.isArray(roles) ? roles : [roles];

    return oidcSecurityService.userData$.pipe(
      map((t) => t.userData),
      map(
        (t) =>
          t &&
          t.roles &&
          Array.isArray(t.roles) &&
          rolesToCheck.some((role) => t.roles.includes(role)),
      ),
      map((t) => (t ? true : router.createUrlTree([redirect]))),
    );
  };
}
