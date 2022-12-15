import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsLetterComponent } from './component/news-letter/news-letter.component';
import { FormsModule } from '@angular/forms';
import { OteosComponentsLibModule } from 'oteos-components-lib';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
  ],
  declarations: [
    NewsLetterComponent
  ],
  exports: [
    NewsLetterComponent
  ],
  providers:[
  ]
})
export class NewsLetterModule { }
