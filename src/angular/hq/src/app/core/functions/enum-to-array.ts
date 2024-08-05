import { of } from 'rxjs';

export interface EnumRecord<T> {
  id: T;
  name: string;
}

export function enumToArray<T extends object>(
  enumeration: T,
  options: unknown[] = [],
): EnumRecord<T>[] {
  return Object.entries(enumeration)
    .filter(
      ([, value]) =>
        isNaN(value) === false &&
        (options.length == 0 || options.includes(value)),
    )
    .map(([key, value]) => ({ id: value, name: key }));
}

export function enumToArrayObservable<T extends object>(
  enumeration: T,
  options: unknown[] = [],
) {
  return of(enumToArray(enumeration, options));
}
