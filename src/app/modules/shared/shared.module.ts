import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfFileViewerModule } from './pdf-file-viewer/pdf-file-viewer.module';
import { PdfFileViewerComponent } from './pdf-file-viewer/pdf-file-viewer.component';

@NgModule({
  imports: [
    CommonModule,
    PdfFileViewerModule,
    PdfViewerModule
  ],
  declarations: [
    PdfFileViewerComponent
  ],
  exports: [
    PdfFileViewerComponent
  ],
  providers: [

  ]
})
export class SharedModule { }
