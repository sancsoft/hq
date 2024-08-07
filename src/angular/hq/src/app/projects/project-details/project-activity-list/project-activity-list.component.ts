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

import { map, firstValueFrom } from 'rxjs';
import { APIError } from '../../../errors/apierror';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

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
  apiErrors: string[] = [];

  constructor(
    private toastService: ToastService,
    public projectDetailsService: ProjectDetailsService,
    private modalService: ModalService,
    private hqService: HQService,
    private route: ActivatedRoute,
  ) {}

  async renameActivity(activityId: string) {
    //get projectId
    const projectId = await firstValueFrom(
      this.projectDetailsService.projectId$,
    );
    if (activityId === '') {
      return;
    }
    this.projectDetailsService.activities$;
    const activity = await firstValueFrom(
      this.projectDetailsService.activities$.pipe(
        map((activities) => activities.find((x) => x.id == activityId)),
      ),
    );
    const newName = await firstValueFrom(
      this.modalService.prompt('Enter new name', '', activity?.name),
    );
    if (newName == null) {
      this.projectDetailsService.refresh();
      return;
    }
    await firstValueFrom(
      this.hqService.upsertProjectActivityV1({
        id: activityId,
        name: newName,
        projectId: projectId,
      }),
    );
    this.toastService.show('Updated', 'Activity has been updated.');
    this.projectDetailsService.refresh();
  }

  async deleteActivity(activityId: string) {
    const confirmation = await firstValueFrom(
      this.modalService.confirm(
        'Confirmation',
        'Activities with time cannot be deleted. Are you sure you want to delete this activity?',
      ),
    );
    if (confirmation) {
      try {
        await firstValueFrom(
          this.hqService.deleteProjectActivityV1({ id: activityId }),
        );
        this.projectDetailsService.refresh();
        this.toastService.show('Success', 'Activity successfully deleted');
      } catch (err) {
        if (err instanceof APIError) {
          await firstValueFrom(
            this.modalService.alert('Error', err.errors.join('\n')),
          );
        }
      }
    }
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    const project = await firstValueFrom(this.projectDetailsService.projectId$);

    try {
      if (this.form.valid) {
        const request = this.form.value;
        await firstValueFrom(
          this.hqService.upsertProjectActivityV1({
            projectId: project,
            ...request,
          }),
        );
        this.projectDetailsService.refresh();
        this.form.controls.name.setValue('');
      } else {
        this.apiErrors.length = 0;
        this.apiErrors.push(
          'Please correct the errors in the form before submitting',
        );
      }
    } catch (err) {
      console.log(err);
      if (err instanceof APIError) {
        this.apiErrors = err.errors;
        console.log(this.apiErrors);
      } else {
        this.apiErrors = ['An unexpected error has occurred.'];
      }
    }
  }
}
