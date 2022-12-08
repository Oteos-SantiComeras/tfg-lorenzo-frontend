import { OteosComponentsLibModule } from 'oteos-components-lib';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { CompaniesService } from './companies.service';
import { CompaniesState } from './store/companies.state';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        CompaniesState
      ]
    )
  ],
  exports: [
  ],
  providers:[
    CompaniesService
  ]
})
export class CompaniesModule { }
