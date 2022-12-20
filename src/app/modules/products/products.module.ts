import { NgxPaginationModule } from 'ngx-pagination';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductsService } from './products.service';
import { ProductsState } from './store/products.state';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OteosComponentsLibModule } from 'oteos-components-lib';
import { NgxsModule } from '@ngxs/store';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        ProductsState,
      ]
    ),
    NgxPaginationModule,
  ],
  declarations: [
    ProductsComponent,
    ProductsListComponent,
    ProductDetailComponent,
  ],
  exports: [
    ProductsComponent,
    ProductsListComponent,
    ProductDetailComponent,
  ],
  providers:[
    ProductsService
  ]
})
export class ProductsModule { }
