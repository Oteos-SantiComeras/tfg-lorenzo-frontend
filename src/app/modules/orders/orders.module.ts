import { OrdersState } from './store/orders.state';
import { OrdersService } from './orders.service';
import { NewOrderComponent } from './components/new-order/new-order.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OteosComponentsLibModule, OteosJoinPipe } from 'oteos-components-lib';
import { NgxsModule } from '@ngxs/store';
import { OrdersComponent } from './components/orders/orders.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OteosComponentsLibModule,
    NgxsModule.forFeature(
      [
        OrdersState
      ]
    ),
  ],
  declarations: [
    NewOrderComponent,
    OrdersComponent,
  ],
  exports: [
    NewOrderComponent,
    OrdersComponent,
  ],
  providers:[
    OrdersService,
    OteosJoinPipe,
  ]
})
export class OrdersModule { }
