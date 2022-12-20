import { CartService } from './../cart.service';
import { Cart } from './../model/cart';
import { OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from '../../../models/pagination';
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap } from "rxjs/operators";
import { CreateCart, DeleteCart, EditCart, FetchCarts } from './cart.actions';

export class CartsStateModel {
  carts: Cart[];
  success: boolean;
  notifyChangeCarts: boolean;
  errorMsg: string;
  successMsg: string;
}

export const CartsStateDefault: CartsStateModel = {
  carts: [],
  success: false,
  notifyChangeCarts: false,
  errorMsg: '',
  successMsg: '',
};

@State<CartsStateModel>({
  name: "carts",
  defaults: CartsStateDefault,
})

@Injectable()
export class CartsState {

  constructor(
    private readonly translateService: OteosTranslateService,
    private readonly cartsService: CartService,
  ) {
    
  }

  @Selector()
  static carts(state: CartsStateModel): Cart[] {
    return state.carts;
  }

  @Selector()
  static success(state: CartsStateModel): boolean {
    return state.success;
  }
  @Selector()
  static notifyChangeCarts(state: CartsStateModel): boolean {
    return state.notifyChangeCarts;
  }

  @Selector()
  static errorMsg(state: CartsStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: CartsStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchCarts)
  public fetchCarts (
    { patchState }: StateContext<CartsStateModel>,
    { payload }: FetchCarts
  ) {
    return this.cartsService.fetchCarts(payload.filter).pipe(
      map((pagination: Pagination) => {
        const carts: any[] = pagination.items;
        patchState({
          carts: carts
        });
      })
    );
  }

  @Action(CreateCart)
  public createCart(
    { patchState }: StateContext<CartsStateModel>,
    { payload }: CreateCart
  ) {
    return this.cartsService.createCart(payload.cart).pipe(
      tap((cart: Cart) => {
        if (cart) {
          patchState({
            carts: [cart],
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.manage-carts.create.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.manage-carts.create.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("User " + payload.cart.user.userName + " not exist")) {
          errorMSg = this.translateService.getTranslate('label.manage-carts.create.user.not.exist');
        } else if (err.error.message == ("Cart " + payload.cart._id + " already exist")) {
          errorMSg = this.translateService.getTranslate('label.manage-carts.create.cart.already.exist');
        } else {
          errorMSg = this.translateService.getTranslate('label.manage-carts.create.error');
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

  @Action(EditCart)
  public editCart(
    { patchState }: StateContext<CartsStateModel>,
    { payload }: EditCart
  ) {
    return this.cartsService
      .editCart(payload._id, payload.newCart)
      .pipe(
        tap((cart: Cart) => {
          if (cart) {
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.manage-carts.update.success'),
            });
          } else {
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.manage-carts.update.error'),
              successMsg: '',
            });
          }
        }),
        catchError((err) => {
          let errorMSg: string = '';
          if (err.error.message == ("User " + payload.newCart.user.userName + " not exist")) {
            errorMSg = this.translateService.getTranslate('label.manage-carts.update.user.not.exist');
          } else if (err.error.message == ("Cart " + payload._id + " not exist")) {
            errorMSg = this.translateService.getTranslate('label.manage-carts.update.cart.not.exist');
          } else {
            errorMSg = this.translateService.getTranslate('label.manage-carts.update.error');
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

  @Action(DeleteCart)
  deleteCart(
    { patchState }: StateContext<CartsStateModel>,
    { payload }: DeleteCart
  ) {
    return this.cartsService.deleteCart(payload._id)
      .pipe(tap((res: boolean) => {
        if (res) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.manage-carts.delete.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.manage-carts.delete.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Cart " + payload._id + " not found")) {
          errorMSg = this.translateService.getTranslate('label.manage-carts.delete.cart.found');
        } else {
          errorMSg = this.translateService.getTranslate('label.manage-carts.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });
      
        throw new Error(err);
      }));
  }
}

