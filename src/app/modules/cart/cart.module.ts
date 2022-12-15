import { CartsState } from './store/cart.state';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './components/cart/cart.component';
import { NgxsModule } from '@ngxs/store';
import { FormsModule } from '@angular/forms';
import { OteosComponentsLibModule, OteosJoinPipe } from 'oteos-components-lib';
import { CartService } from './cart.service';
import { ManageCartsComponent } from './components/manage-carts/manage-carts.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        CartsState
      ]
    ),
  ],
  declarations: [
    CartComponent,
    ManageCartsComponent,
  ],
  exports: [
    CartComponent,
    ManageCartsComponent,
  ],
  providers:[
    CartService,
    OteosJoinPipe,
  ]
})
export class CartModule { }
