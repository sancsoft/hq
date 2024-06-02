import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clients',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./clients/clients.component').then((m) => m.ClientsComponent),
    children: [
      {
        path: '',
        title: 'Client List',
        loadComponent: () =>
          import('./clients/client-list/client-list.component').then(
            (m) => m.ClientListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create Client',
        loadComponent: () =>
          import('./clients/client-create/client-create.component').then(
            (m) => m.ClientCreateComponent
          ),
      },
      {
        path: 'edit/:clientId',
        title: 'Edit Client',
        loadComponent: () =>
          import('./clients/client-edit/client-edit.component').then(
            (m) => m.ClientEditComponent
          ),
      },
      {
        path: ':clientId',
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
            loadComponent: () =>
              import(
                './clients/client-details/client-project-list/client-project-list.component'
              ).then((m) => m.ClientProjectListComponent),
          },
          {
            path: 'quotes',
            title: 'Client Quotes',
            loadComponent: () =>
              import(
                './clients/client-details/client-quote-list/client-quote-list.component'
              ).then((m) => m.ClientQuoteListComponent),
          },
          {
            path: 'services',
            title: 'Client Services',
            loadComponent: () =>
              import(
                './clients/client-details/client-service-list/client-service-list.component'
              ).then((m) => m.ClientServiceListComponent),
          },
          {
            path: 'invoices',
            title: 'Client Invoices',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./psr/psr.component').then((m) => m.PSRComponent),
    children: [
      {
        path: '',
        title: 'PSR List',
        loadComponent: () =>
          import('./psr/psrlist/psrlist.component').then(
            (m) => m.PSRListComponent
          ),
      },
      {
        path: ':psrId',
        title: 'PSR Details',
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
            loadComponent: () =>
              import('./psr/psrtime-list/psrtime-list.component').then(
                (m) => m.PSRTimeListComponent
              ),
          },
          {
            path: 'report',
            title: 'PSR Report',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./projects/projects.component').then((m) => m.ProjectsComponent),
    children: [
      {
        path: '',
        title: 'Project List',
        loadComponent: () =>
          import('./projects/project-list/project-list.component').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create Project',
        loadComponent: () =>
          import('./projects/project-create/project-create.component').then(
            (m) => m.ProjectCreateComponent
          ),
      },
      {
        path: ':projectId',
        title: 'Project Details',
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
            loadComponent: () =>
              import(
                './projects/project-details/project-details.component'
              ).then((m) => m.ProjectDetailsComponent),
          },
          {
            path: 'edit',
            title: 'Edit Project',
            loadComponent: () =>
              import('./projects/project-edit/project-edit.component').then(
                (m) => m.ProjectEditComponent
              ),
          },
          {
            path: 'report',
            title: 'Project PSR Report',
            loadComponent: () =>
              import('./projects/project-report/project-report.component').then(
                (m) => m.ProjectReportComponent
              ),
          },
          {
            path: 'time',
            title: 'Project PSR Time',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./quotes/quotes.component').then((m) => m.QuotesComponent),
    children: [
      {
        path: '',
        title: 'Quote List',
        loadComponent: () =>
          import('./quotes/quotes-list/quotes-list.component').then(
            (m) => m.QuotesListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create Quote',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./Invoices/invoices-list/invoices-list.component').then(
        (m) => m.InvoicesListComponent
      ),
  },
  {
    path: 'services',
    title: 'Service List',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./Services-Agreement/services-list/services-list.component').then(
        (m) => m.ServicesListComponent
      ),
  },
  {
    path: 'users',
    title: 'Users',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        title: 'User List',
        loadComponent: () =>
          import('./users/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          ),
      },
      {
        path: 'create',
        title: 'Create User',
        loadComponent: () =>
          import('./users/users-create/users-create.component').then(
            (m) => m.UsersCreateComponent
          ),
      },
      {
        path: 'edit/:userId',
        title: 'Edit User',
        loadComponent: () =>
          import('./users/users-edit/users-edit.component').then(
            (m) => m.UsersEditComponent
          ),
      },
    ],
  },
];
