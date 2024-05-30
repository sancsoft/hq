import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProjectStatus } from '../clients/client-details.service';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GetStaffV1Record } from '../models/staff-members/get-staff-member-v1';
import { HQService } from '../services/hq.service';

export enum ActivityName {
  Support = 0,
  Development = 1,
  Todo = 2,
}

@Injectable({
  providedIn: 'root',
})
export class PsrService {
  search = new FormControl<string | null>('');

  constructor(private hqService: HQService) {
    const response$ = this.hqService.getStaffMembersV1({});
  }

  resetFilter() {
    this.search.setValue('');
  }
}
