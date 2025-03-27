import { Routes } from '@angular/router';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { userRoleGuard } from './guards/user-role.guard';
import { HQRole } from './enums/hqrole';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'callback',
    title: 'Login...',
    loadComponent: () =>
      import('./callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: 'kitchen-sink',
    title: 'Kitchen Sink',
    canActivate: [AutoLoginPartialRoutesGuard],
    loadComponent: () =>
      import('./core/components/kitchen-sink/kitchen-sink.component').then(
        (m) => m.KitchenSinkComponent,
      ),
  },
  {
    path: 'chargecodes',
    title: 'Charge Codes',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('.//charge-code/charge-code.component').then(
        (m) => m.ChargeCodeComponent,
      ),
    children: [
      {
        path: '',
        title: 'Charge Code List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import(
            './charge-code/charge-code-list/charge-code-list.component'
          ).then((m) => m.ChargeCodeListComponent),
      },
      {
        path: 'create',
        title: 'Charge Code Create',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import(
            './charge-code/charge-code-create/charge-code-create.component'
          ).then((m) => m.ChargeCodeCreateComponent),
      },
      {
        path: 'edit/:chargeCodeId',
        title: 'Charge Code Edit',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import(
            './charge-code/charge-code-edit/charge-code-edit.component'
          ).then((m) => m.ChargeCodeEditComponent),
      },
    ],
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
            (m) => m.ClientListComponent,
          ),
      },
      {
        path: 'create',
        title: 'Create Client',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./clients/client-create/client-create.component').then(
            (m) => m.ClientCreateComponent,
          ),
      },
      {
        path: 'edit/:clientId',
        title: 'Edit Client',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./clients/client-edit/client-edit.component').then(
            (m) => m.ClientEditComponent,
          ),
      },
      {
        path: ':clientId',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./clients/client-details/client-details.component').then(
            (m) => m.ClientDetailsComponent,
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
            (m) => m.PSRListComponent,
          ),
      },
      {
        path: ':psrId',
        title: 'PSR Details',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./psr/psrdetails/psrdetails.component').then(
            (m) => m.PSRDetailsComponent,
          ),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'report',
          },
          {
            path: 'time',
            title: 'PSR Time',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import('./psr/psrtime-list/psrtime-list.component').then(
                (m) => m.PSRTimeListComponent,
              ),
          },
          {
            path: 'report',
            title: 'PSR Report',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import('./psr/psrreport/psrreport.component').then(
                (m) => m.PSRReportComponent,
              ),
          },
        ],
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
            (m) => m.ProjectListComponent,
          ),
      },
      {
        path: 'create',
        title: 'Create Project',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./projects/project-create/project-create.component').then(
            (m) => m.ProjectCreateComponent,
          ),
      },
      {
        path: ':projectId',
        title: 'Project Details',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./projects/project-details/project-details.component').then(
            (m) => m.ProjectDetailsComponent,
          ),
        children: [
          {
            path: '',
            title: 'Project Details',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './projects/project-details/project-view/project-view.component'
              ).then((m) => m.ProjectViewComponent),
          },
          {
            path: 'edit',
            title: 'Edit Project',
            canActivate: [userRoleGuard(HQRole.Administrator)],
            loadComponent: () =>
              import(
                './projects/project-details/project-edit/project-edit.component'
              ).then((m) => m.ProjectEditComponent),
          },
          {
            path: 'activities',
            title: 'Project Activities',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './projects/project-details/project-activity-list/project-activity-list.component'
              ).then((m) => m.ProjectActivityListComponent),
          },
          {
            path: 'roster',
            title: 'Project Roster',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './projects/project-details/project-roster-list/project-roster-list.component'
              ).then((m) => m.ProjectRosterListComponent),
          },
          {
            path: 'report',
            title: 'Project PSR Report',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './projects/project-details/project-report/project-report.component'
              ).then((m) => m.ProjectReportComponent),
          },
          {
            path: 'time',
            title: 'Project PSR Time',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './projects/project-details/project-time/project-time.component'
              ).then((m) => m.ProjectTimeComponent),
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
            (m) => m.QuotesListComponent,
          ),
      },
      {
        path: 'create',
        title: 'Create Quote',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./quotes/quotes-create/quotes-create.component').then(
            (m) => m.QuotesCreateComponent,
          ),
      },
      {
        path: 'edit/:quoteId',
        title: 'Edit Quote',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./quotes/quotes-edit/quotes-edit.component').then(
            (m) => m.QuotesEditComponent,
          ),
      },
    ],
  },
  {
    path: 'invoices',
    title: 'Invoices',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./Invoices/invoices.component').then(
        (m) => m.InvoicesComponent,
      ),
      children: [
        {
          path: '',
          title: 'Invoice List',
          canActivate: [userRoleGuard(HQRole.Staff)],
          loadComponent: () => 
            import('./Invoices/invoices-list/invoices-list.component').then(
              (m) => m.InvoicesListComponent,
            )
        },
        {
          path: ':invoiceId',
          canActivate: [userRoleGuard(HQRole.Staff)],
          loadComponent: () =>
            import('./Invoices/invoice-details/invoice-details.component').then(
              (m) => m.InvoiceDetailsComponent,
            ),
          children:[
            {
              path: 'details',
              canActivate: [userRoleGuard(HQRole.Staff)],
              loadComponent: () =>
                import('./Invoices/invoice-details/invoice-details-edit/invoice-details-edit.component').then(
                  (m) => m.InvoiceDetailsEditComponent,
            ),
            },
            {
              path: 'time',
              canActivate: [userRoleGuard(HQRole.Staff)],
              loadComponent: () =>
                import('./Invoices/invoice-details/invoice-time/invoice-time.component').then(
                  (m) => m.InvoiceTimeEntriesComponent,
                )
            },

          ]
        },
        {
          path: 'create',
          title: 'Create Invoice',
          canActivate: [userRoleGuard(HQRole.Staff)],
          loadComponent: () =>
            import('./Invoices/invoices-create/invoices-create.component').then(
              (m) => m.InvoicesCreateComponent,
            )
        }
      ]
  },
  {
    path: 'services',
    title: 'Service List',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./Services-Agreement/services-list/services-list.component').then(
        (m) => m.ServicesListComponent,
      ),
  },
  {
    path: 'users',
    title: 'Users',
    canActivate: [
      AutoLoginPartialRoutesGuard,
      userRoleGuard(HQRole.Administrator),
    ],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        title: 'User List',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./users/users-list/users-list.component').then(
            (m) => m.UsersListComponent,
          ),
      },
      {
        path: 'create',
        title: 'Create User',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./users/users-create/users-create.component').then(
            (m) => m.UsersCreateComponent,
          ),
      },
      {
        path: 'edit/:userId',
        title: 'Edit User',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./users/users-edit/users-edit.component').then(
            (m) => m.UsersEditComponent,
          ),
      },
    ],
  },
  {
    path: 'holidays',
    title: 'Holiday',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./holiday/holiday.component').then((m) => m.HolidayComponent),
    children: [
      {
        path: '',
        title: 'Holiday List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./holiday/holiday-list/holiday-list.component').then(
            (m) => m.HolidayListComponent,
          ),
      },
      {
        path: 'create',
        title: 'Create Holiday',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./holiday/holiday-create/holiday-create.component').then(
            (m) => m.HolidayCreateComponent,
          ),
      },
      {
        path: 'edit/:holidayId',
        title: 'Edit Holiday',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./holiday/holiday-edit/holiday-edit.component').then(
            (m) => m.HolidayEditComponent,
          ),
      },
    ],
  },
  {
    path: 'staff',
    title: 'Staff',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        title: 'Staff',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./staff/staff-list/staff-list.component').then(
            (m) => m.StaffListComponent,
          ),
      },
      {
        path: ':staffId/timesheet',
        canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./staff/staff-timesheet/staff-timesheet.component').then(
            (m) => m.StaffTimesheetComponent,
          ),
      },
      {
        path: ':staffId',
        title: 'staff Details',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./staff/staff-details/staff-details.component').then(
            (m) => m.StaffDetailsComponent,
          ),
        children: [
          {
            path: '',
            title: 'staff View',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './staff/staff-details/staff-view/staff-view.component'
              ).then((m) => m.StaffViewComponent),
          },

          {
            path: 'contacts',
            title: 'staff Contacts',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './staff/staff-details/staff-contacts/staff-contacts.component'
              ).then((m) => m.StaffContactsComponent),
          },
        ],
      },
    ],
  },
  {
    path: 'staff-admin',
    title: 'Staff Admin',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
    children: [
      {
        path: '',
        title: 'Staff',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import(
            './staff-admin/staff-admin-list/staff-admin-list.component'
          ).then((m) => m.StaffAdminListComponent),
      },
      {
        path: 'create',
        title: 'Create Staff',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./staff-admin/staff-create/staff-create.component').then(
            (m) => m.StaffCreateComponent,
          ),
      },
      {
        path: ':staffId/timesheet',
        canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./staff/staff-timesheet/staff-timesheet.component').then(
            (m) => m.StaffTimesheetComponent,
          ),
      },
      {
        path: ':staffId',
        title: 'staff Details',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./staff/staff-details/staff-details.component').then(
            (m) => m.StaffDetailsComponent,
          ),
        children: [
          {
            path: '',
            title: 'staff View',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './staff/staff-details/staff-view/staff-view.component'
              ).then((m) => m.StaffViewComponent),
          },
          {
            path: 'edit',
            title: 'Edit Staff',
            canActivate: [userRoleGuard(HQRole.Administrator)],
            loadComponent: () =>
              import('./staff-admin/staff-edit/staff-edit.component').then(
                (m) => m.StaffEditComponent,
              ),
          },
          {
            path: 'contacts',
            title: 'staff Contacts',
            canActivate: [userRoleGuard(HQRole.Staff)],
            loadComponent: () =>
              import(
                './staff/staff-details/staff-contacts/staff-contacts.component'
              ).then((m) => m.StaffContactsComponent),
          },
        ],
      },
    ],
  },

  {
    path: 'times',
    title: 'Times',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./times/times.component').then((m) => m.TimesComponent),
    children: [
      {
        path: '',
        title: 'Time List',
        canActivate: [userRoleGuard(HQRole.Staff)],
        loadComponent: () =>
          import('./times/time-list/time-list.component').then(
            (m) => m.TimeListComponent,
          ),
      },
      {
        path: 'create',
        title: 'Time Create',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./times/time-create/time-create.component').then(
            (m) => m.TimeCreateComponent,
          ),
      },
      {
        path: 'edit/:timeId',
        title: 'Time Edit',
        canActivate: [userRoleGuard(HQRole.Administrator)],
        loadComponent: () =>
          import('./times/time-edit/time-edit.component').then(
            (m) => m.TimeEditComponent,
          ),
      },
    ],
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'planning/points',
    title: 'Planning Points',
    canActivate: [AutoLoginPartialRoutesGuard, userRoleGuard(HQRole.Staff)],
    loadComponent: () =>
      import('./planning/planning-points/planning-points.component').then(
        (m) => m.PlanningPointsComponent,
      ),
  },
];
