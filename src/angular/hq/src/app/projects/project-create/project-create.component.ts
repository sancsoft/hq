import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, map, shareReplay, switchMap } from 'rxjs';
import { GetStaffV1Record } from '../../models/staff-members/get-staff-member-v1';
import { HQService } from '../../services/hq.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientListComponent } from '../../clients/client-list/client-list.component';

@Component({
  selector: 'hq-project-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ClientListComponent],
  templateUrl: './project-create.component.html'
})
export class ProjectCreateComponent {
  projectManagers$: Observable<GetStaffV1Record[]>;
  apiErrors?: string[];
  selectedClientId = new BehaviorSubject<string | null>(null);

  modalOpen = false;
  constructor(private hqService: HQService) {
    const response$ =  this.hqService.getStaffMembersV1({});

    this.projectManagers$ = response$.pipe(
      map((response) => {
        return response.records;
      })
    );
    this.projectManagers$.subscribe((records) => { console.log(records); });
  }
  updateSelectedClient(clientId: string) {
    console.log(clientId);
    this.selectedClientId.next(clientId);
  }


  // async submit() {
  //   this.form.markAsTouched();
  //   if(this.form.invalid) {
  //     return;
  //   }

  //   try
  //   {
  //     const request = this.form.value;
  //     const response = await firstValueFrom(this.hqService.upsertClientV1(request));
  //     this.router.navigate(['../', response.id], { relativeTo: this.route });
  //   }
  //   catch(err)
  //   {
  //     if(err instanceof APIError)
  //     {
  //       this.apiErrors = err.errors;
  //     }
  //     else
  //     {
  //       this.apiErrors = ['An unexpected error has occurred.'];
  //     }
  //   }
  // }
}
