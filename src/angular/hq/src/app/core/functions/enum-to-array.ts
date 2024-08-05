import { of } from 'rxjs';

export interface EnumRecord<T> {
  id: T;
  name: string;
}

export function enumToArray<T extends object>(enumeration: T): EnumRecord<T>[] {
  return Object.entries(enumeration)
    .filter(([, value]) => isNaN(value) === false)
    .map(([key, value]) => ({
      id: value,
      name: key.replace(/([A-Z])/g, ' $1').trim(),
    }));
}

export function enumToArrayObservable<T extends object>(enumeration: T) {
  return of(enumToArray(enumeration));
}
