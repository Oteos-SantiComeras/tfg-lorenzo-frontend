import { RoleState } from './../roles/store/roles.state';
import { UsersService } from './users.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { UsersState } from './store/users.state';
import { UsersComponent } from './components/users/users.component';
import { OteosComponentsLibModule, OteosJoinPipe } from 'oteos-components-lib';
import { RegisterComponent } from './components/register/register.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        UsersState,
        RoleState,
      ]
    )
  ],
  declarations: [
    UsersComponent,
    RegisterComponent,
  ],
  exports: [
    UsersComponent,
    RegisterComponent
  ],
  providers: [
    UsersService,
    OteosJoinPipe,
  ],
})

export class UsersModule {}
