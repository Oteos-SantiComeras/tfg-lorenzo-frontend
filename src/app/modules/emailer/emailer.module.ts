import { OteosComponentsLibModule } from 'oteos-components-lib';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { EmailerState } from './store/emailer.state';

@NgModule({
  declarations: [],
  
  imports: [
    CommonModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        EmailerState
      ]
    )
  ]
})

export class EmailerModule { }
