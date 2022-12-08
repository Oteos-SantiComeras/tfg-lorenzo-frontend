import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsService } from './permissions.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { PermissionsState } from './store/permissions.state';
import { OteosComponentsLibModule, OteosJoinPipe } from 'oteos-components-lib';
import { PermissionsComponent } from './components/permissions/permissions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        PermissionsState
      ]
    )
  ],
  declarations: [
    PermissionsComponent
  ],
  exports: [
    PermissionsComponent
  ],
  providers:[
    PermissionsService,
    OteosJoinPipe
  ]
})
export class PermissionsModule { }
