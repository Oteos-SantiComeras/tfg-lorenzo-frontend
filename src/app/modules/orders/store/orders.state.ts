import { FetchOrders, CreateOrder, EditOrder, DeleteOrder, SubscribeOrdersWS, UnSubscribeOrdersWS } from './orders.actions';
import { OrdersService } from './../orders.service';
import { Order } from './../model/order';
import { OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from '../../../models/pagination';
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap } from "rxjs/operators";

export class OrdersStateModel {
  orders: Order[];
  success: boolean;
  notifyChangeOrders: boolean;
  errorMsg: string;
  successMsg: string;
}

export const OrdersStateDefault: OrdersStateModel = {
  orders: [],
  success: false,
  notifyChangeOrders: false,
  errorMsg: '',
  successMsg: '',
};

@State<OrdersStateModel>({
  name: "orders",
  defaults: OrdersStateDefault,
})

@Injectable()
export class OrdersState {

  constructor(
    private readonly translateService: OteosTranslateService,
    private readonly ordersService: OrdersService,
  ) {
    
  }

  @Selector()
  static orders(state: OrdersStateModel): Order[] {
    return state.orders;
  }

  @Selector()
  static success(state: OrdersStateModel): boolean {
    return state.success;
  }
  @Selector()
  static notifyChangeOrders(state: OrdersStateModel): boolean {
    return state.notifyChangeOrders;
  }

  @Selector()
  static errorMsg(state: OrdersStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: OrdersStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchOrders)
  public fetchOrders (
    { patchState }: StateContext<OrdersStateModel>,
    { payload }: FetchOrders
  ) {
    return this.ordersService.fetchOrders(payload.filter).pipe(
      map((pagination: Pagination) => {
        const orders: any[] = pagination.items;
        patchState({
          orders: orders
        });
      })
    );
  }

  @Action(CreateOrder)
  public createOrder(
    { patchState }: StateContext<OrdersStateModel>,
    { payload }: CreateOrder
  ) {
    return this.ordersService.createOrder(payload.order).pipe(
      tap((order: Order) => {
        if (order) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.manage-orders.create.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.manage-orders.create.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Cart " + payload.order.cart._id + " not exist")) {
          errorMSg = this.translateService.getTranslate('label.manage-orders.create.cart.not.exist');
        } else {
          errorMSg = this.translateService.getTranslate('label.manage-orders.create.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });

        throw new Error(err);
      })
    );
  }

  @Action(EditOrder)
  public editOrder(
    { patchState }: StateContext<OrdersStateModel>,
    { payload }: EditOrder
  ) {
    return this.ordersService
      .editOrder(payload._id, payload.newOrder)
      .pipe(
        tap((order: Order) => {
          if (order) {
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.manage-orders.update.success'),
            });
          } else {
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.manage-orders.update.error'),
              successMsg: '',
            });
          }
        }),
        catchError((err) => {
          let errorMSg: string = '';
          if (err.error.message == ("Order " + payload._id + " not exist")) {
            errorMSg = this.translateService.getTranslate('label.manage-orders.update.order.not.exist');
          } else if (err.error.message == ("Cart " + payload.newOrder.cart._id + " not exist")) {
            errorMSg = this.translateService.getTranslate('label.manage-orders.update.cart.not.exist');
          } else {
            errorMSg = this.translateService.getTranslate('label.manage-orders.update.error');
          }

          patchState({
            success: false,
            errorMsg: errorMSg,
            successMsg: '',
          });
        
          throw new Error(err);
        })
      );
  }

  @Action(DeleteOrder)
  deleteOrder(
    { patchState }: StateContext<OrdersStateModel>,
    { payload }: DeleteOrder
  ) {
    return this.ordersService.deleteOrder(payload._id)
      .pipe(tap((res: boolean) => {
        if (res) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.manage-orders.delete.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.manage-orders.delete.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Order " + payload._id + " not found")) {
          errorMSg = this.translateService.getTranslate('label.manage-orders.delete.order.not.found');
        } else {
          errorMSg = this.translateService.getTranslate('label.manage-orders.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });
      
        throw new Error(err);
      }));
  }

  @Action(SubscribeOrdersWS)
  public subscribeCartsWS(ctx: StateContext<OrdersStateModel>) {
    return this.ordersService.getOrdersBySocket().pipe(
      map((change: boolean) => {
        if(change){
        let state = ctx.getState();
        state = {
          ...state,
          notifyChangeOrders: !state.notifyChangeOrders,
        };
        ctx.setState({
          ...state,
        });
      }
      })
    )
  }

  @Action(UnSubscribeOrdersWS)
  public unSubscribeCartsWS(ctx: StateContext<OrdersStateModel>) {
    this.ordersService.removeSocket();
  }
}

