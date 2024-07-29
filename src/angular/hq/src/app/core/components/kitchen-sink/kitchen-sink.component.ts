import { StatDisplayComponent } from './../stat-display/stat-display.component';
import { Component } from '@angular/core';
import { SearchInputComponent } from '../search-input/search-input.component';
import { FormLabelComponent } from '../form-label/form-label.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidationErrorDirective } from '../../directives/validation-error.directive';
import { TextInputComponent } from '../text-input/text-input.component';
import { ButtonComponent } from '../button/button.component';
import { DateInputComponent } from '../date-input/date-input.component';
import { SelectInputComponent } from '../select-input/select-input.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { TextareaInputComponent } from '../textarea-input/textarea-input.component';
import { localISODate } from '../../../common/functions/local-iso-date';
import { ProjectStatus } from '../../../clients/client-details.service';
import { GetPSRRecordV1 } from '../../../models/PSR/get-PSR-v1';
import { Period } from '../../../models/times/get-time-v1';
import { DualPanelComponent } from '../dual-panel/dual-panel.component';
import { SelectInputOptionDirective } from '../../directives/select-input-option.directive';
import { PanelComponent } from '../panel/panel.component';
import { AngularSplitModule } from 'angular-split';

@Component({
  selector: 'hq-kitchen-sink',
  standalone: true,
  imports: [
    SearchInputComponent,
    FormLabelComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrorDirective,
    TextInputComponent,
    ButtonComponent,
    DateInputComponent,
    SelectInputComponent,
    ProgressBarComponent,
    TextareaInputComponent,
    StatDisplayComponent,
    PanelComponent,
    DualPanelComponent,
    SelectInputOptionDirective,
    AngularSplitModule,
  ],
  templateUrl: './kitchen-sink.component.html',
})
export class KitchenSinkComponent {
  public form = new FormGroup({
    select: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    textarea: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    checkbox: new FormControl<boolean>(false),
    radio: new FormControl<string | null>('option1'),
    date: new FormControl<string | null>(localISODate(), {
      validators: [Validators.required],
    }),
    search: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    text: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });
  public date = new FormControl<string | null>(localISODate(), {
    validators: [Validators.required],
  });
  public select = new FormControl<string | null>('Toyota', {});
  public search = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.minLength(3)],
  });

  public text = new FormControl<string | null>(null, {
    validators: [Validators.required, Validators.minLength(3)],
  });
  public ProjectStatus = ProjectStatus;
  Math = Math;
  public report: GetPSRRecordV1 = {
    id: 'ca900b96-37c5-4d20-8526-f8670049cfd7',
    submittedAt: null,
    chargeCode: 'Q4997',
    clientId: '0eb00183-aa9c-47db-8fc2-278f8e560b01',
    clientName: 'Smithers',
    projectName: 'BOS',
    projectId: 'c345e400-77e0-4210-924d-6f8b9d552a44',
    report: null!,
    projectManagerId: null,
    projectManagerName: 'jsarkauskas',
    totalHours: 646.75,
    totalAvailableHours: null!,
    thisHours: 32.5,
    thisPendingHours: 32.5,
    bookingHours: 62.5,
    bookingAvailableHours: 37.5,
    status: 5,
    totalPercentComplete: null!,
    bookingPercentComplete: 0.625,
    totalStartDate: new Date('2024-01-02'),
    totalEndDate: new Date('2024-06-14'),
    startDate: new Date('2024-06-08'),
    endDate: new Date('2024-06-14'),
    bookingStartDate: new Date('2024-06-03'),
    bookingEndDate: new Date('2024-06-14'),
    bookingPeriod: 2,
    lastId: null!,
    lastHours: null!,
    isLate: true,
    summaryHoursTotal: 646.75,
    summaryHoursAvailable: null!,
    summaryPercentComplete: null!,
    isCurrentPsrPeriod: false,
  };
  public second_report: GetPSRRecordV1 = {
    id: '9f8f375f-0b7d-4452-946c-b78b220d95d7',
    submittedAt: new Date('2024-06-27T18:02:24.502088Z'),
    chargeCode: 'Q5145',
    clientId: '7247f53a-0733-458d-b3df-ca86fe94ea0f',
    clientName: 'GeoSci',
    projectName: 'CIS',
    projectId: '95c90872-28e9-4687-9993-4b5301097b5d',
    report: 'No planned activities.',
    projectManagerName: 'bmcvicker',
    totalHours: 165.25,
    totalAvailableHours: 494.75,
    thisHours: 0,
    thisPendingHours: 0,
    bookingHours: 0,
    bookingAvailableHours: 0,
    status: 5,
    totalPercentComplete: 0.25037878787878787,
    bookingPercentComplete: 0,
    startDate: new Date('2024-06-08'),
    endDate: new Date('2024-06-14'),
    bookingStartDate: null!,
    bookingEndDate: null!,
    bookingPeriod: 2,
    isLate: false,
    summaryHoursTotal: 165.25,
    summaryHoursAvailable: 494.75,
    summaryPercentComplete: 0.25037878787878787,
    isCurrentPsrPeriod: true,
  };

  third_report: GetPSRRecordV1 = {
    id: 'aeed2fe8-9d65-48f4-b714-52078179cf84',
    submittedAt: new Date('2024-07-02T13:27:23.181842Z'),
    chargeCode: 'P1053',
    clientId: '86883422-2695-4281-96e6-b25d63f85197',
    clientName: 'ITS',
    projectName: 'ITSPortal',
    projectId: '4a9ba5b4-b6ba-4acb-9d44-fcc485b6ce22',
    report:
      'Lot of work with \n\nPNC Bank Integration\nIssue with Card 550 data issue (No Charge)\nonboarding Pri\n',
    projectManagerId: 'c0dbdb26-c971-4378-845b-dffd6f30d344',
    projectManagerName: 'jsarkauskas',
    totalHours: 671.25,
    totalAvailableHours: null!,
    thisHours: 77.5,
    thisPendingHours: 0,
    bookingHours: 286.25,
    bookingAvailableHours: -226.25,
    status: ProjectStatus.Ongoing,
    totalPercentComplete: null!,
    bookingPercentComplete: 4.770833333333333,
    totalStartDate: new Date('2024-01-02'),
    totalEndDate: new Date('2024-06-28'),
    startDate: new Date('2024-06-22'),
    endDate: new Date('2024-06-28'),
    bookingStartDate: new Date('2024-06-03'),
    bookingEndDate: new Date('2024-06-28'),
    bookingPeriod: 2,
    lastId: '57f76611-5073-4d7c-8157-364349e8c537',
    lastHours: 78.25,
    isLate: false,
    summaryHoursTotal: 286.25,
    summaryHoursAvailable: -226.25,
    summaryPercentComplete: 4.770833333333333,
    isCurrentPsrPeriod: false,
  };
  fourth_report: GetPSRRecordV1 = {
    id: '74d6274a-9c01-44b3-8f4e-b893b6fe4a4c',
    submittedAt: new Date('2024-07-08T14:44:39.584342Z'),
    chargeCode: 'P1018',
    clientId: 'a0cf8097-c787-4c37-8d7f-4f5f805a9240',
    clientName: 'TREMCO',
    projectName: 'Warranty',
    projectId: '5b856373-5d0f-43a4-b442-707d0e756a61',
    report: 'Automatically submitted.',
    projectManagerId: 'c0dbdb26-c971-4378-845b-dffd6f30d344',
    projectManagerName: 'jsarkauskas',
    totalHours: 479,
    totalAvailableHours: null!,
    thisHours: 33.25,
    thisPendingHours: 0,
    bookingHours: 143.5,
    bookingAvailableHours: -63.5,
    status: 6,
    totalPercentComplete: null!,
    bookingPercentComplete: 1.79375,
    totalStartDate: new Date('2024-01-02'),
    totalEndDate: new Date('2024-05-31'),
    startDate: new Date('2024-05-27'),
    endDate: new Date('2024-06-02'),
    bookingStartDate: new Date('2024-05-01'),
    bookingEndDate: new Date('2024-05-31'),
    bookingPeriod: 2, // replace with the actual period
    lastId: null!,
    lastHours: null!,
    isLate: false,
    summaryHoursTotal: 143.5,
    summaryHoursAvailable: -63.5,
    summaryPercentComplete: 1.79375,
    isCurrentPsrPeriod: true,
  };

  toggleDisabled() {
    if (this.search.disabled) {
      this.search.enable();
      this.text.enable();
    } else {
      this.search.disable();
      this.text.disable();
    }
  }
  getPeriodName(period: Period) {
    return Period[period];
  }
  clicked() {
    console.log('Button clicked');
  }
}
