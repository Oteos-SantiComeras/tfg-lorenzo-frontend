import { PasswordRecoveryComponent } from './components/password-recovery/password-recovery.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './components/auth/auth.component';
import { OteosComponentsLibModule } from 'oteos-components-lib';
import { NgxsModule } from '@ngxs/store';
import { AuthState } from './store/auth.state';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        AuthState
      ]
    )
  ],
  declarations: [
    AuthComponent,
    LogoutComponent,
    PasswordRecoveryComponent
  ],
  exports: [
    AuthComponent,
    LogoutComponent,
    PasswordRecoveryComponent
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule { }
