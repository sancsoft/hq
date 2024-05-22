import { Component, HostListener } from '@angular/core';
import { SortDirection } from '../../models/common/sort-direction';
import {
  GetPSRTimeRecordV1,
  SortColumn,
} from '../../models/PSR/get-psr-time-v1';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  firstValueFrom,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { HQService } from '../../services/hq.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'hq-psrdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './psrdetails.component.html',
})
export class PSRDetailsComponent {
  apiErrors: string[] = [];

  time$: Observable<GetPSRTimeRecordV1[]>;
  timeIds$: Observable<string[]>;
  sortOption$: BehaviorSubject<SortColumn>;
  sortDirection$: BehaviorSubject<SortDirection>;

  selectedTimes$ = new BehaviorSubject<string[]>([]);
  lastSelectedTime$ = new BehaviorSubject<string | null>(null);
  shiftKey$ = new BehaviorSubject<boolean>(false);

  sortColumn = SortColumn;
  sortDirection = SortDirection;

  constructor(private hqService: HQService, private route: ActivatedRoute) {
    this.sortOption$ = new BehaviorSubject<SortColumn>(SortColumn.Date);
    this.sortDirection$ = new BehaviorSubject<SortDirection>(SortDirection.Asc);

    // const search$ = psrService.search.valueChanges.pipe(
    //   tap((t) => this.goToPage(1)),
    //   startWith(psrService.search.value)
    // );

    const psrId$ = this.route.params.pipe(map((params) => params['psrId']));

    const request$ = combineLatest({
      // search: search$,
      projectStatusReportId: psrId$,
      sortBy: this.sortOption$,
      sortDirection: this.sortDirection$,
    });

    const response$ = request$.pipe(
      debounceTime(500),
      switchMap((request) => this.hqService.getPSRTimeV1(request)),
      shareReplay(1)
    );

    this.time$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );
    this.timeIds$ = this.time$.pipe(map((response) => {
      return response.map((t) => t.id);
    }))
    this.timeIds$.subscribe((t) => console.log(t));
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftKey$.next(event.shiftKey);
    }
  }
  @HostListener('window:keyup', ['$event'])
  onKeyup(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftKey$.next(event.shiftKey);
    }
  }
  @HostListener('window:blur', ['$event'])
  onBlur(event: KeyboardEvent) {
    this.shiftKey$.next(false);
  }

  isSelected(timeId: string) {
    return this.selectedTimes$.pipe(
      map((selected) => selected.includes(timeId))
    );
  }

  deselectAll() {
    this.selectedTimes$.next([]);
    this.lastSelectedTime$.next(null);
  }

  async toggleTime(timeId: string) {
    let selected = [...(await firstValueFrom(this.selectedTimes$))];
    let shift = await firstValueFrom(this.shiftKey$);

    if (selected.includes(timeId)) {
      selected.splice(selected.indexOf(timeId), 1);
    } else {
      selected.push(timeId);
    }

    if (shift) {
      let startRowTimeIndex = 0
      let endRowTimeIndex = 0
      let timeIds = await firstValueFrom(this.timeIds$);
      let indexForShiftTime = timeIds.indexOf(timeId);
      let indexesOfSelectedTimes = selected.map((t) => timeIds.indexOf(t));
      startRowTimeIndex = Math.min(Math.min(...indexesOfSelectedTimes), indexForShiftTime);
      endRowTimeIndex = Math.max(Math.max(...indexesOfSelectedTimes), indexForShiftTime);

      this.deselectAll();
      selected = timeIds.slice(startRowTimeIndex, endRowTimeIndex + 1);
    }

    this.selectedTimes$.next(selected);
    this.lastSelectedTime$.next(timeId);
  }
}
