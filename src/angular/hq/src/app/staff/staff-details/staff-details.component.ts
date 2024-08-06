import { StaffDetailsService } from './staff-details.service';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Component, OnDestroy } from '@angular/core';
import { map, ReplaySubject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StatDisplayComponent } from '../../core/components/stat-display/stat-display.component';
import { ButtonComponent } from '../../core/components/button/button.component';

@Component({
  selector: 'hq-staff-details',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    StatDisplayComponent,
    ButtonComponent
  ],
  templateUrl: './staff-details.component.html',
})
export class StaffDetailsComponent implements OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    public staffDetailsService: StaffDetailsService,
    private route: ActivatedRoute,
  ) {
    const staffId$ = route.paramMap.pipe(map((t) => t.get('staffId')));

    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    staffId$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (staffId) => this.staffDetailsService.setStaffId(staffId),
      error: console.error,
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
