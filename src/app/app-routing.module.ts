import { NewsLetterComponent } from './modules/news-letter/component/news-letter/news-letter.component';
import { OrdersComponent } from './modules/orders/components/orders/orders.component';
import { NewOrderComponent } from './modules/orders/components/new-order/new-order.component';
import { ManageCartsComponent } from './modules/cart/components/manage-carts/manage-carts.component';
import { CartComponent } from './modules/cart/components/cart/cart.component';
import { ProductDetailComponent } from './modules/products/components/product-detail/product-detail.component';
import { ProductsListComponent } from './modules/products/components/products-list/products-list.component';
import { ProductsComponent } from './modules/products/components/products/products.component';
import { CategoriesComponent } from './modules/categories/components/categories/categories.component';
import { RegisterComponent } from './modules/users/components/register/register.component';
import { PermissionsComponent } from './modules/permissions/components/permissions/permissions.component';
import { RolesComponent } from './modules/roles/components/roles/roles.component';
import { UsersComponent } from './modules/users/components/users/users.component';
import { AuthComponent } from './modules/auth/components/auth/auth.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogoutComponent } from './modules/auth/components/logout/logout.component';
import { roleList } from './constants/roles.constants';
import { AuthGuard } from './modules/auth/services/auth.guard.service';
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
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'products-list',
    component: ProductsListComponent,
  },
  {
    path: 'product-detail/:code',
    component: ProductDetailComponent,
  },
  {
    path: 'manage-carts',
    component: ManageCartsComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.ADMIN] },
  },
  {
    path: 'new-order',
    component: NewOrderComponent,
    canActivate: [AuthGuard],
    data: { roles: [roleList.USER] },
  },
  {
    path: 'news-letter',
    component: NewsLetterComponent,
  },
  //
  { path: '', redirectTo: 'news-letter', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true } )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
