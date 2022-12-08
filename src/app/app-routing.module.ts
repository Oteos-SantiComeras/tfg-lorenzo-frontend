import { CategoriesComponent } from './modules/categories/components/categories/categories.component';
import { PdfFileViewerComponent } from './modules/shared/pdf-file-viewer/pdf-file-viewer.component';
import { RegisterComponent } from './modules/users/components/register/register.component';
import { PermissionsComponent } from './modules/permissions/components/permissions/permissions.component';
import { RolesComponent } from './modules/roles/components/roles/roles.component';
import { UsersComponent } from './modules/users/components/users/users.component';
import { AuthComponent } from './modules/auth/components/auth/auth.component';
import { OptionsComponent } from './modules/options/options.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogoutComponent } from './modules/auth/components/logout/logout.component';
import { roleList } from './constants/roles.constants';
import { AuthGuard } from './services/auth.guard.service';
import { PasswordRecoveryComponent } from './modules/auth/components/password-recovery/password-recovery.component';

const routes: Routes = [
  {
    path: 'auth/logout',
    component: LogoutComponent,
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'auth/login',
    component: AuthComponent,
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'auth/recovery/:pwdRecovery',
    component: PasswordRecoveryComponent,
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'users/register',
    component: RegisterComponent,
  },
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'permissions',
    component: PermissionsComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'pdf-file-viewer',
    component: PdfFileViewerComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.USER] },
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  //
  { path: '', redirectTo: '', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true } )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
