import { RolesComponent } from './components/roles/roles.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { RoleState } from './store/roles.state';
import { RolesService } from './roles.service';
import { OteosComponentsLibModule, OteosJoinPipe } from 'oteos-components-lib';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        RoleState
      ]
    )
  ],
  declarations: [
    RolesComponent,
  ],
  exports: [
    RolesComponent
  ],
  providers: [
    RolesService,
    OteosJoinPipe
  ]
})
export class RolesModule { }
