import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap,
  combineLatest,
} from 'rxjs';
import { GetProjectRecordV1 } from '../../models/projects/get-project-v1';
import { HQService } from '../../services/hq.service';
import { GetClientRecordV1 } from '../../models/clients/get-client-v1';
import { GetProjectActivityRecordV1 } from '../../models/projects/get-project-activity-v1';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HQRole } from '../../enums/hqrole';

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsService {
  projectId$: Observable<string>;
  psrId$: Observable<string | null>;
  clientId$: Observable<string>;
  client$: Observable<GetClientRecordV1>;
  project$: Observable<GetProjectRecordV1>;
  activities$: Observable<GetProjectActivityRecordV1[]>;
  HQRole = HQRole;
  private projectIdSubject = new BehaviorSubject<string | null>(null);
  private psrIdSubject = new BehaviorSubject<string | null | undefined>(null);
  private refreshSubject = new Subject<void>();
  canManageProjectStatusReport$: Observable<boolean>;

  constructor(
    private hqService: HQService,
    private oidcSecurityService: OidcSecurityService,
  ) {
    const projectId$ = this.projectIdSubject.asObservable().pipe(
      filter((projectId) => projectId != null),
      map((projectId) => projectId!),
    );

    const refreshProjectId$ = this.refreshSubject.pipe(
      switchMap(() => projectId$),
    );

    this.projectId$ = merge(projectId$, refreshProjectId$);

    this.activities$ = this.projectId$.pipe(
      switchMap((projectId) =>
        this.hqService.getprojectActivitiesV1({ projectId }),
      ),
      map((t) => t.records),
    );

    this.psrId$ = this.psrIdSubject.asObservable().pipe(map((psrId) => psrId!));

    this.project$ = this.projectId$.pipe(
      switchMap((projectId) => this.hqService.getProjectsV1({ id: projectId })),
      map((t) => t.records[0]),
      tap((t) => console.log(t)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.clientId$ = this.project$.pipe(map((project) => project.clientId));

    this.client$ = this.clientId$.pipe(
      switchMap((clientId) => this.hqService.getClientsV1({ id: clientId })),
      map((t) => t.records[0]),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.canManageProjectStatusReport$ = combineLatest({
      userData: oidcSecurityService.userData$.pipe(map((t) => t.userData)),
      project: this.project$,
    }).pipe(
      map(
        (t) =>
          t.userData.roles &&
          Array.isArray(t.userData.roles) &&
          (t.userData.roles.includes(HQRole.Administrator) ||
            t.userData.roles.includes(HQRole.Executive) ||
            t.userData.roles.includes(HQRole.Partner) ||
            (t.userData.roles.includes(HQRole.Manager) &&
              t.project.projectManagerId == t.userData.staff_id)),
      ),
      map((t) => !!t),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  setProjectId(projectId?: string | null) {
    if (projectId) {
      this.projectIdSubject.next(projectId);
    }
  }

  setPsrId(psrId?: string | null) {
    this.psrIdSubject.next(psrId);
  }
  refresh() {
    this.refreshSubject.next();
  }
}
