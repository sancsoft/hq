import { Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clients',
    pathMatch: 'full',
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: 'clients',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./clients/clients.component').then((m) => m.ClientsComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./clients/client-list/client-list.component').then(
            (m) => m.ClientListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./clients/client-create/client-create.component').then(
            (m) => m.ClientCreateComponent
          ),
      },
      {
        path: 'edit/:clientId',
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
            loadComponent: () =>
              import(
                './clients/client-details/client-project-list/client-project-list.component'
              ).then((m) => m.ClientProjectListComponent),
          },
          {
            path: 'quotes',
            loadComponent: () =>
              import(
                './clients/client-details/client-quote-list/client-quote-list.component'
              ).then((m) => m.ClientQuoteListComponent),
          },
          {
            path: 'services',
            loadComponent: () =>
              import(
                './clients/client-details/client-service-list/client-service-list.component'
              ).then((m) => m.ClientServiceListComponent),
          },
          {
            path: 'invoices',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./psr/psr.component').then((m) => m.PSRComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./psr/psrlist/psrlist.component').then(
            (m) => m.PSRListComponent
          ),
      },
      {
        path: ':psrId',
        loadComponent: () =>
          import('./psr/psrdetails/psrdetails.component').then(
            (m) => m.PSRDetailsComponent
          ),
      },
    ],
  },
  {
    path: 'projects',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./projects/projects.component').then((m) => m.ProjectsComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./projects/project-list/project-list.component').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./projects/project-create/project-create.component').then(
            (m) => m.ProjectCreateComponent
          ),
      },
      {
        path: ':projectId',
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
            loadComponent: () =>
              import(
                './projects/project-details/project-details.component'
              ).then((m) => m.ProjectDetailsComponent),
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('./projects/project-edit/project-edit.component').then(
                (m) => m.ProjectEditComponent
              ),
          },
          {
            path: 'report',
            loadComponent: () =>
              import('./projects/project-report/project-report.component').then(
                (m) => m.ProjectReportComponent
              ),
          },
          {
            path: 'time',
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
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./quotes/quotes.component').then((m) => m.QuotesComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./quotes/quotes-list/quotes-list.component').then(
            (m) => m.QuotesListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./quotes/quotes-create/quotes-create.component').then(
            (m) => m.QuotesCreateComponent
          ),
      },
    ],
  },
  {
    path: 'invoices',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./Invoices/invoices-list/invoices-list.component').then(
        (m) => m.InvoicesListComponent
      ),
  },
  {
    path: 'services',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./Services-Agreement/services-list/services-list.component').then(
        (m) => m.ServicesListComponent
      ),
  },
  {
    path: 'users',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          ),
      },

    ]
  }
];
