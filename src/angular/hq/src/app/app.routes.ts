import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { userRoleGuard } from './guards/user-role.guard';
import { HQRole } from './enums/hqrole';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'psr',
    pathMatch: 'full'
  },
  {
    path: 'callback',
    title: 'Login...',
    loadComponent: () =>
      import('./callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: 'clients',
    title: 'Clients',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./clients/clients.component').then((m) => m.ClientsComponent),
    children: [
      {
        path: '',
        title: 'Client List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./clients/client-list/client-list.component').then(
            (m) => m.ClientListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create Client',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./clients/client-create/client-create.component').then(
            (m) => m.ClientCreateComponent
          ),
      },
      {
        path: 'edit/:clientId',
        title: 'Edit Client',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./clients/client-edit/client-edit.component').then(
            (m) => m.ClientEditComponent
          ),
      },
      {
        path: ':clientId',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./clients/client-details/client-details.component').then(
            (m) => m.ClientDetailsComponent
          ),
        children: [
          {
            path: '',
            redirectTo: 'projects',
            pathMatch: 'full',
          },
          {
            path: 'projects',
            title: 'Client Projects',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './clients/client-details/client-project-list/client-project-list.component'
              ).then((m) => m.ClientProjectListComponent),
          },
          {
            path: 'quotes',
            title: 'Client Quotes',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './clients/client-details/client-quote-list/client-quote-list.component'
              ).then((m) => m.ClientQuoteListComponent),
          },
          {
            path: 'services',
            title: 'Client Services',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './clients/client-details/client-service-list/client-service-list.component'
              ).then((m) => m.ClientServiceListComponent),
          },
          {
            path: 'invoices',
            title: 'Client Invoices',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './clients/client-details/client-invoices-list/client-invoices.list.component'
              ).then((m) => m.ClientInvoicesComponent),
          },
        ],
      },
    ],
  },
  {
    path: 'psr',
    title: 'PSR',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./psr/psr.component').then((m) => m.PSRComponent),
    children: [
      {
        path: '',
        title: 'PSR List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./psr/psrlist/psrlist.component').then(
            (m) => m.PSRListComponent
          ),
      },
      {
        path: ':psrId',
        title: 'PSR Details',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./psr/psrdetails/psrdetails.component').then(
            (m) => m.PSRDetailsComponent
          ),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'time'
          },
          {
            path: 'time',
            title: 'PSR Time',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import('./psr/psrtime-list/psrtime-list.component').then(
                (m) => m.PSRTimeListComponent
              ),
          },
          {
            path: 'report',
            title: 'PSR Report',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import('./psr/psrreport/psrreport.component').then(
                (m) => m.PSRReportComponent
              ),
          }
        ]
      },
    ],
  },
  {
    path: 'projects',
    title: 'Projects',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./projects/projects.component').then((m) => m.ProjectsComponent),
    children: [
      {
        path: '',
        title: 'Project List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./projects/project-list/project-list.component').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create Project',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./projects/project-create/project-create.component').then(
            (m) => m.ProjectCreateComponent
          ),
      },
      {
        path: ':projectId',
        title: 'Project Details',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./projects/project-view/project-view.component').then(
            (m) => m.ProjectViewComponent
          ),
        children: [
          {
            path: '',
            redirectTo: 'details',
            pathMatch: 'full',
          },
          {
            path: 'details',
            title: 'Project Details',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './projects/project-details/project-details.component'
              ).then((m) => m.ProjectDetailsComponent),
          },
          {
            path: 'edit',
            title: 'Edit Project',
            canActivate: [userRoleGuard(HQRole.Administrator)],
            loadComponent: () =>
              import('./projects/project-edit/project-edit.component').then(
                (m) => m.ProjectEditComponent
              ),
          },
          {
            path: 'report',
            title: 'Project PSR Report',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import('./projects/project-report/project-report.component').then(
                (m) => m.ProjectReportComponent
              ),
          },
          {
            path: 'time',
            title: 'Project PSR Time',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import('./projects/project-time/project-time.component').then(
                (m) => m.ProjectTimeComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'quotes',
    title: 'Quotes',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./quotes/quotes.component').then((m) => m.QuotesComponent),
    children: [
      {
        path: '',
        title: 'Quote List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./quotes/quotes-list/quotes-list.component').then(
            (m) => m.QuotesListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create Quote',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./quotes/quotes-create/quotes-create.component').then(
            (m) => m.QuotesCreateComponent
          ),
      },
    ],
  },
  {
    path: 'invoices',
    title: 'Invoice List',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./Invoices/invoices-list/invoices-list.component').then(
        (m) => m.InvoicesListComponent
      ),
  },
  {
    path: 'services',
    title: 'Service List',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./Services-Agreement/services-list/services-list.component').then(
        (m) => m.ServicesListComponent
      ),
  },
  {
    path: 'users',
    title: 'Users',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Administrator)],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        title: 'User List',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./users/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create User',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./users/users-create/users-create.component').then(
            (m) => m.UsersCreateComponent
          ),
      },
      {
        path: 'edit/:userId',
        title: 'Edit User',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./users/users-edit/users-edit.component').then(
            (m) => m.UsersEditComponent
          ),
      },
    ],
  },
  {
    path: 'staff',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Administrator)],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./staff/staff-list/staff-list.component').then(
            (m) => m.StaffListComponent
          ),
      },
      {
        path: 'create',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./staff/staff-create/staff-create.component').then(
            (m) => m.StaffCreateComponent
          ),
      },
      {
        path: 'edit/:staffId',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./staff/staff-edit/staff-edit.component').then(
            (m) => m.StaffEditComponent
          ),
      },
    ],
  }
];
