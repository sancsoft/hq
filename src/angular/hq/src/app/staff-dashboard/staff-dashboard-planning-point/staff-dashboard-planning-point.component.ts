import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'hq-staff-dashboard-planning-point',
  standalone: true,
  imports: [],
  templateUrl: './staff-dashboard-planning-point.component.html',
})
export class StaffDashboardPlanningPointComponent {
  @Input()
  form!: FormGroup;

  @Output()
  hqPlanPointChange = new EventEmitter<FormGroup>();

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.hqPlanPointChange.emit(this.form);
    });
  }
}
