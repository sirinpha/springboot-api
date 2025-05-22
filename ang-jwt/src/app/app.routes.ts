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


  {
    path: 'employee-list',
    loadComponent: () => import('./components/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] }
  },

];
