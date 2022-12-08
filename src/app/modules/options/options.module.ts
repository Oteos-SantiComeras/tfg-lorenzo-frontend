import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsComponent } from './options.component';
import { OteosClickOutsideModule, OteosComponentsLibModule, OteosNgModelBaseModule } from 'oteos-components-lib';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    OteosClickOutsideModule,
    OteosNgModelBaseModule
  ],
  declarations: [
    OptionsComponent
  ],
  exports: [
    OptionsComponent
  ]
})
export class OptionsModule { }
