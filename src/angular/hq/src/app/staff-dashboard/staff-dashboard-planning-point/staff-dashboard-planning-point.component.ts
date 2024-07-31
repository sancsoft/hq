import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { SelectInputOptionDirective } from '../../core/directives/select-input-option.directive';
import { SelectInputComponent } from '../../core/components/select-input/select-input.component';
import { HQService } from '../../services/hq.service';

import { PlanningPoint } from '../../models/Points/get-points-v1';
import { ReplaySubject, skip, takeUntil } from 'rxjs';

export interface HQPlanningPointChangeEvent {
  id?: string | null;
  chargeCodeId?: string | null;
  chargeCode?: string | null;
  projectName?: string | null;
  projectId?: string | null;
  sequence?: number | null;
  completed?: boolean | null;
}
export interface PointForm {
  id: FormControl<string | null>;
  chargeCodeId: FormControl<string | null>;
  chargeCode: FormControl<string | null>;
  projectName: FormControl<string | null>;
  projectId: FormControl<string | null>;
  sequence: FormControl<number | null>;
  completed: FormControl<boolean | null>;
}

@Component({
  selector: 'tr[hq-staff-dashboard-planning-point]',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkDragHandle,
    CdkDrag,
    SelectInputOptionDirective,
    SelectInputComponent,
  ],
  templateUrl: './staff-dashboard-planning-point.component.html',
})
export class StaffDashboardPlanningPointComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input()
  point?: Partial<PlanningPoint>;
  @Input()
  chargeCodes: GetChargeCodeRecordV1[] | null = [];
  @Input()
  editMode!: boolean | null;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  projectName?: string | null;

  form = new FormGroup<PointForm>({
    id: new FormControl<string | null>(null),
    chargeCodeId: new FormControl<string | null>(null, { updateOn: 'change' }),
    chargeCode: new FormControl<string | null>(null),
    projectName: new FormControl<string | null>(null),
    projectId: new FormControl<string | null>(null),
    completed: new FormControl<boolean | null>(null),
    sequence: new FormControl<number | null>(null),
  });

  constructor(private hqService: HQService) {
    this.form.controls.chargeCodeId.valueChanges
      .pipe(skip(1), takeUntil(this.destroyed$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe, rxjs/no-ignored-error
      .subscribe((t) => {
        this.point!.projectName = this.chargeCodes?.find(
          (c) => c.id === t,
        )?.projectName;
      });
  }

  ngOnInit(): void {
    console.log('ngOnit planning point');
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['point'] && changes['point'].currentValue) {
      this.form.patchValue(changes['point'].currentValue);
    }
  }

  ngOnDestroy(): void {
    console.log('Component Destroyed');
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
