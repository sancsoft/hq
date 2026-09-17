import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsSearchService {
  private _searchTerm: string | null = null;
  private selectedWeekOfSource = new BehaviorSubject<string | null>(null);
  private searchTermSource = new BehaviorSubject<string | null>(null);

  selectedWeekOf$: Observable<string | null> =
    this.selectedWeekOfSource.asObservable();
  searchTerm$: Observable<string | null> = this.searchTermSource.asObservable();

  selectedWeekDateString$ = this.selectedWeekOf$.pipe(debounceTime(300));

  searchTermDebounced$: Observable<string | null> = this.searchTerm$.pipe(
    debounceTime(300),
  );

  setWeekOf(date: string | null) {
    this.selectedWeekOfSource.next(date);
  }

  setSearch(term: string | null) {
    this.searchTermSource.next(term);
  }

  reset() {
    this.selectedWeekOfSource.next(null);
    this.searchTermSource.next(null);
  }

  get searchTerm(): string | null {
    return this._searchTerm;
  }

  set searchTerm(value: string | null) {
    this._searchTerm = value;
    this.searchTermSource.next(value);
  }
}
