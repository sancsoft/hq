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

import { map, firstValueFrom, Observable, switchMap } from 'rxjs';
import { APIError } from '../../../errors/apierror';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import {
  GetStaffV1Record,
  //GetStaffV1Request,
} from '../../../models/staff-members/get-staff-member-v1';

interface Form {
  staffId: FormControl<string>;
}

@Component({
  selector: 'hq-project-roster-list',
  standalone: true,
  imports: [CoreModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './project-roster-list.component.html',
})
export class ProjectRosterListComponent {
  projectMembers$: Observable<GetStaffV1Record[]>;
  allStaff$: Observable<GetStaffV1Record[]>;

  form = new FormGroup<Form>({
    staffId: new FormControl('', {
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
  ) {
    this.projectMembers$ = this.projectDetailsService.projectId$.pipe(
      switchMap((projectId) => this.hqService.getStaffMembersV1({ projectId })),
      map((t) => t.records),
    );
    this.allStaff$ = this.projectDetailsService.projectId$.pipe(
      switchMap((excludeProjectId) =>
        this.hqService.getStaffMembersV1({
          currentOnly: true,
          excludeProjectId,
        }),
      ),
      map((t) => t.records),
    );
  }

  async removeProjectMember(staffId: string) {
    const projectId = await firstValueFrom(
      this.projectDetailsService.projectId$,
    );
    const confirmation = await firstValueFrom(
      this.modalService.confirm(
        'Confirmation',
        'Are you sure you want to delete this staff member?',
      ),
    );
    if (confirmation) {
      try {
        await firstValueFrom(
          this.hqService.removeProjectMemberV1({
            staffId: staffId,
            projectId,
          }),
        );
        this.projectDetailsService.refresh();
        this.toastService.show('Success', 'Staff member successfully removed');
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
    const request = this.form.value;
    try {
      if (this.form.valid) {
        await firstValueFrom(
          this.hqService.addProjectMemberV1({
            projectId: project,
            ...request,
          }),
        );
        this.toastService.show('Added', 'Staff member has been added');
        this.projectDetailsService.refresh();
        this.form.controls.staffId.setValue('');
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
