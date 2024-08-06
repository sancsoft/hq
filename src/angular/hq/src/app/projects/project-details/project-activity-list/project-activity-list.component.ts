import { Component } from '@angular/core';
import { ProjectDetailsService } from '../project-details.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CoreModule } from '../../../core/core.module';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal.service';
import { HQService } from '../../../services/hq.service';

interface Form {
  name: FormControl<string>;
}

@Component({
  selector: 'hq-project-activity-list',
  standalone: true,
  imports: [CoreModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './project-activity-list.component.html',
})
export class ProjectActivityListComponent {
  form = new FormGroup<Form>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    public projectDetailsService: ProjectDetailsService,
    private modalService: ModalService,
    private hqService: HQService,
  ) {}

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      // TODO: Create activity
    }
  }
}
