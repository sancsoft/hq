import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlanningPoint } from '../../models/Points/get-points-v1';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { SelectInputOptionDirective } from '../../core/directives/select-input-option.directive';
import { SelectInputComponent } from '../../core/components/select-input/select-input.component';
import { HQService } from '../../services/hq.service';
import { shareReplay, takeUntil } from 'rxjs/operators';
import { map, Observable, ReplaySubject, Subscription } from 'rxjs';

@Component({
  selector: 'tr[hq-staff-dashboard-planning-point]',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkDragHandle,
    SelectInputOptionDirective,
    SelectInputComponent,
  ],
  templateUrl: './staff-dashboard-planning-point.component.html',
})
export class StaffDashboardPlanningPointComponent {
  @Input()
  form!: FormGroup;
  @Input()
  point!: PlanningPoint;
  @Input()
  chargeCodes: GetChargeCodeRecordV1[] | null = [];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Output()
  hqPlanPointChange = new EventEmitter<FormGroup>();
  chargeCodes$: Observable<GetChargeCodeRecordV1[]>;

  constructor(private hqService: HQService) {
    this.chargeCodes$ = this.hqService.getChargeCodeseV1({}).pipe(
      map((t) => t.records),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  ngOnInit(): void {
    console.log('ngOnit planning point');
    console.log(this.form.controls);
    // eslint-disable-next-line rxjs-angular/prefer-async-pipe, rxjs/no-ignored-error, rxjs-angular/prefer-takeuntil
    // this.form.controls['chargeCodeId'].valueChanges.subscribe((d) => {
    //   this.hqPlanPointChange.emit(this.form);
    // });
  }

  planningPointChargeCodeChanged(event: any) {
    this.hqPlanPointChange.emit(this.form);
  }
  ngOnDestroy(): void {
    console.log('Component Destroyed');
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
