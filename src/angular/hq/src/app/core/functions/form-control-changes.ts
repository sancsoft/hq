import { FormControl } from '@angular/forms';
import { concat, defer, Observable, of } from 'rxjs';

/**
 * @param formControl
 * @returns An observable that will emit the current value followed by any changes.
 */
export function formControlChanges<T>(
  formControl: FormControl<T>,
): Observable<T> {
  return concat(
    defer(() => of(formControl.value)),
    formControl.valueChanges,
  );
}
