import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { APIError } from '../../errors/apierror';

export const badRequestInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status == 400) {
        return throwError(() => new APIError(err.error));
      }

      throw err;
    }),
  );
};
