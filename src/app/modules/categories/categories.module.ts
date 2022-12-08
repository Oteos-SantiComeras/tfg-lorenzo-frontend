import { CategoriesService } from './categories.service';
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoriesState } from './store/categories.state';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OteosComponentsLibModule, OteosJoinPipe } from 'oteos-components-lib';
import { NgxsModule } from '@ngxs/store';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        CategoriesState
      ]
    )
  ],
  declarations: [
    CategoriesComponent
  ],
  exports: [
    CategoriesComponent
  ],
  providers:[
    CategoriesService,
    OteosJoinPipe
  ]
})
export class CategoriesModule { }
