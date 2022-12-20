import { NewsLetterModule } from './modules/news-letter/news-letter.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ngxsConfig } from './../environments/constants';
import { AuthModule } from './modules/auth/auth.module';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { OteosComponentsLibModule, OteosTranslateService } from 'oteos-components-lib';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { AuthGuard } from './modules/auth/services/auth.guard.service';
import { TokenInterceptor } from './modules/auth/services/token.interceptor';
import { NgxPaginationModule } from 'ngx-pagination';
import { CartModule } from './modules/cart/cart.module';

export function translateFactory(provider: OteosTranslateService) {
  return () => provider.getData('assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxsModule.forRoot([], ngxsConfig),
    NgxsStoragePluginModule.forRoot({
      key: ["auth"],
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxPaginationModule,
    OteosComponentsLibModule,
    AuthModule,
    PermissionsModule,
    RolesModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    NewsLetterModule,
  ],
  providers: [
    AuthGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: translateFactory,
      deps: [OteosTranslateService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }