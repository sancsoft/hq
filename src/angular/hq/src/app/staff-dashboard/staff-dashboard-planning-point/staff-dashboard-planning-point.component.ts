import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormControlName,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PlanningPoint } from '../../models/Points/get-points-v1';
import { GetChargeCodeRecordV1 } from '../../models/charge-codes/get-chargecodes-v1';
import { CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
  selector: 'tr[hq-staff-dashboard-planning-point]',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdkDragHandle],
  templateUrl: './staff-dashboard-planning-point.component.html',
})
export class StaffDashboardPlanningPointComponent {
  @Input()
  form!: FormGroup;
  @Input()
  point!: PlanningPoint;
  @Input()
  chargeCodes!: GetChargeCodeRecordV1[];

  @Output()
  hqPlanPointChange = new EventEmitter<FormGroup>();

  ngOnInit(): void {}
  planningPointChargeCodeChanged(event: any) {
    this.hqPlanPointChange.emit(this.form);
  }
}
