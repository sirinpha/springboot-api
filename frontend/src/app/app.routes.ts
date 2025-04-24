import { Routes } from '@angular/router';
import {AuthGuard} from './jwtClient/auth.guard';
import {RegisterComponent} from './components/register/register.component';
import {LoginComponent} from './components/login/login.component';
import {EmployeeListComponent} from './components/employee-list/employee-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', redirectTo: '/register', pathMatch: 'full' },

  // {path: 'employee-list',
  // component: EmployeeListComponent,
  // canActivate: [AuthGuard] },

  // {
  //   path: 'employee-list',
  //   loadComponent: () => import('./components/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
  //   canActivate: [AuthGuard],
  //   data: { roles: ['ADMIN'] }
  // },
  // {
  //   path: 'employee-list',
  //   loadComponent: () => import('./components/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
  //   canActivate: [AuthGuard],
  //   data: { roles: ['USER', 'ADMIN'] }
  // },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'employee-list',
    loadComponent: () => import('./components/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] }
  },
  // {
  //   path: 'employees',
  //   component: EmployeeListComponent,
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'employees/add',
  //   component: EmployeeFormComponent,
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { role: 'ROLE_ADMIN' }
  // },
  // {
  //   path: 'employees/edit/:id',
  //   component: EmployeeFormComponent,
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { role: 'ROLE_ADMIN' }
  // },

];
