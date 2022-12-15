import { CreateCart } from './../../../cart/store/cart.actions';
import { Router } from '@angular/router';
import { OrdersState } from './../../store/orders.state';
import { CreateOrder } from './../../store/orders.actions';
import { CartsState } from './../../../cart/store/cart.state';
import { AuthState } from './../../../auth/store/auth.state';
import { Store } from '@ngxs/store';
import { User } from './../../../users/model/user';
import { OteosCacheService, OteosConstantsService, OteosModalService, OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Order } from '../../model/order';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {

  public order: Order;

  constructor(
    private readonly cacheService: OteosCacheService,
    private readonly locationService: Location,
    private readonly store: Store,
    public readonly constantsService: OteosConstantsService,
    private readonly modalService: OteosModalService,
    private readonly toastService: OteosToastService,
    public readonly translateService: OteosTranslateService,
    private readonly router: Router,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.orders.cache.title'));
    this.order = new Order();
  }

  ngOnInit() {
    const userLogged: User = this.store.selectSnapshot(AuthState.loggedUser);
    if (!userLogged) {
      this.comeBack();
      return;
    }

    this.order.cart = this.cacheService.getElement("cart");
    if (!this.order.cart) {
      this.comeBack();
      return;
    }

    if (!this.order.cart.products || this.order.cart.products.length == 0) {
      this.comeBack();
      return;
    }
  }

  private comeBack() {
    this.locationService.back();
  }

  /* Store Actions */
  createCart(order: Order) {
    this.store.dispatch(new CreateCart({ cart: order.cart })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(CartsState.success);

        if(success){
          this.createOrder(order);
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.store.selectSnapshot(CartsState.errorMsg)
          );
        }
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.store.selectSnapshot(CartsState.errorMsg)
        );
      }
    });
  }

  createOrder(order: Order) {
    const cart = this.store.selectSnapshot(CartsState.carts)[0];
    order.cart = cart;
    order.phone = Number.parseInt(order.phone.toString());
    order.zipCode = Number.parseInt(order.zipCode.toString());
    order.paidOut = true;

    this.store.dispatch(new CreateOrder({ order: order })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(OrdersState.success);

        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.store.selectSnapshot(OrdersState.successMsg)
          );

          this.order = undefined;
          this.cacheService.setElement("cart", undefined);
          this.router.navigateByUrl("/products-list");
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.store.selectSnapshot(OrdersState.errorMsg)
          );
        }
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.store.selectSnapshot(OrdersState.errorMsg)
        );
      }
    });
  }

  /* Form Actions */
  onCLickCancelOrderBtn() {
    this.comeBack();
    return;
  }

  onCLickFinishOrderBtn() {
    const errorMsg: string = this.validateForm();
    if (errorMsg) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate("label.error.title"),
        errorMsg
      );
      return;
    }

    this.modalService.open('confirm-buy-order');
  }

  private validateForm() {
    if (!this.order.name) {
      return this.translateService.getTranslate('label.orders.error.name');
    }

    if (!this.order.secondName) {
      return this.translateService.getTranslate('label.orders.error.secondName');
    }

    if (!this.order.email) {
      return this.translateService.getTranslate('label.orders.error.email');
    }

    if (!this.order.phone) {
      return this.translateService.getTranslate('label.orders.error.phone');
    }

    if (!this.order.country) {
      return this.translateService.getTranslate('label.orders.error.country');
    }

    if (!this.order.address) {
      return this.translateService.getTranslate('label.orders.error.address');
    }

    if (!this.order.zipCode) {
      return this.translateService.getTranslate('label.orders.error.zipCode');
    }

    return null;
  }

  /* Finish Order Modal Actions */
  closeModalConfirmBuyOrder($event) {

  }

  acceptModalConfirmBuyOrder($event) {
    const user: User = this.store.selectSnapshot(AuthState.loggedUser);
    this.order.cart.user = user;

    this.createCart(this.order);
  }
}
