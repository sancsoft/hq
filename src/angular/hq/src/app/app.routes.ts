import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
    },
    {
        path: 'clients',
        loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./clients/client-list/client-list.component').then(m => m.ClientListComponent),
            },
            {
                path: 'create',
                loadComponent: () => import('./clients/client-create/client-create.component').then(m => m.ClientCreateComponent)
            },
            {
                path: ':clientId',
                loadComponent: () => import('./clients/client-details/client-details.component').then(m => m.ClientDetailsComponent),
                children: [
                    {
                        path: '',
                        redirectTo: 'projects',
                        pathMatch: 'full'
                    },
                    {
                        path: 'projects',
                        loadComponent: () => import('./clients/client-details/client-project-list/client-project-list.component').then(m => m.ClientProjectListComponent),
                    },
                    {
                        path: 'quotes',
                        loadComponent: () => import('./clients/client-details/client-quote-list/client-quote-list.component').then(m => m.ClientQuoteListComponent),
                    },
                    {
                        path: 'services',
                        loadComponent: () => import('./clients/client-details/client-service-list/client-service-list.component').then(m => m.ClientServiceListComponent),
                    }
                ]
            }
        ]
    },
    {
        path: 'psr',
        loadComponent: () => import('./psr/psr.component').then(m => m.PSRComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./psr/psrlist/psrlist.component').then(m => m.PSRListComponent),
            },
            {
                path: ':psrId',
                loadComponent: () => import('./psr/psrdetails/psrdetails.component').then(m => m.PSRDetailsComponent)
            }
        ]
    },
    {
        path: 'projects',
        loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./projects/project-list/project-list.component').then(m => m.ProjectListComponent),
            },
            {
                path: 'create',
                loadComponent: () => import('./projects/project-create/project-create.component').then(m => m.ProjectCreateComponent)
            },
            {
                path: ':psrId',
                loadComponent: () => import('./projects/project-details/project-details.component').then(m => m.ProjectDetailsComponent),
            }
        ]
    }
];
