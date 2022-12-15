import { Router } from '@angular/router';
import { Product } from './../../../products/model/product';
import { AuthState } from './../../../auth/store/auth.state';
import { OteosTranslateService, OteosCacheService, OteosConstantsService, OteosModalService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/modules/users/model/user';
import { Cart } from '../../model/cart';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  public cart: Cart;

  constructor(
    public readonly translateService: OteosTranslateService,
    public readonly cacheService: OteosCacheService,
    private readonly store: Store,
    private readonly router: Router,
    public readonly constantsService: OteosConstantsService,
    private readonly modalService: OteosModalService,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.cart.cache.title'));
    this.cart = this.cacheService.getElement("cart");
  }

  ngOnInit() {
  }

  /* Cart Actions */
  getTotalPriceWithTaxsOfProduct(product: Product, amount: number) {
    const productPrice: number = product.price;
    const totalProductPrice: number = Number.parseFloat(productPrice.toString()) * Number.parseFloat(amount.toString());
    const taxSum: number = (Number.parseFloat(totalProductPrice.toString()) * 21) / 100;

    return (Number.parseFloat(totalProductPrice.toString()) + Number.parseFloat(taxSum.toString()));
  }

  onClickCleanBtn() {
    this.cart = undefined;
    this.cacheService.setElement("cart", this.cart);
  }

  onClickBuyBtn() {
    const loggedUser: User = this.store.selectSnapshot(AuthState.loggedUser);
    if (!loggedUser) {
      this.modalService.open("confirm-go-register");
    } else {
      this.router.navigateByUrl("/new-order");
    }
  }
  
  onClickPlusProduct(product: Product) {
    const index: number = this.cart.products.indexOf(product);
    this.cart.amounts[index] = this.cart.amounts[index] + 1;

    let totalItems: number = 0;
    let totalPrice: number = 0;
    let totalPublicPrice: number = 0;
    for (const product of this.cart.products) {
      const index: number = this.cart.products.indexOf(product);

      totalItems = Number.parseFloat(totalItems.toString()) + Number.parseFloat(this.cart.amounts[index].toString());

      let totalPriceProduct: number = 0;
      totalPriceProduct = Number.parseFloat(product.price.toString()) * Number.parseFloat(this.cart.amounts[index].toString());
      totalPrice = Number.parseFloat(totalPrice.toString()) + Number.parseFloat(totalPriceProduct.toString());

      let totalPublicPriceProduct: number = 0;
      totalPublicPriceProduct = Number.parseFloat(product.publicSellPrice.toString()) * Number.parseFloat(this.cart.amounts[index].toString());
      totalPublicPrice = Number.parseFloat(totalPublicPrice.toString()) + Number.parseFloat(totalPublicPriceProduct.toString());
    }

    this.cart.totalItems = totalItems;
    this.cart.totalPrice = totalPrice;
    this.cart.totalPriceTaxs = totalPublicPrice;
    
    this.cacheService.setElement("cart", this.cart);
  }

  onClickMinusProduct(product: Product) {
    const index: number = this.cart.products.indexOf(product);

    const currentAmount: number = this.cart.amounts[index];
    if (currentAmount <= 0) {
      return;
    }

    this.cart.amounts[index] = this.cart.amounts[index] - 1;

    let totalItems: number = 0;
    let totalPrice: number = 0;
    let totalPublicPrice: number = 0;
    for (const product of this.cart.products) {
      const index: number = this.cart.products.indexOf(product);

      totalItems = Number.parseFloat(totalItems.toString()) + Number.parseFloat(this.cart.amounts[index].toString());

      let totalPriceProduct: number = 0;
      totalPriceProduct = Number.parseFloat(product.price.toString()) * Number.parseFloat(this.cart.amounts[index].toString());
      totalPrice = Number.parseFloat(totalPrice.toString()) + Number.parseFloat(totalPriceProduct.toString());

      let totalPublicPriceProduct: number = 0;
      totalPublicPriceProduct = Number.parseFloat(product.publicSellPrice.toString()) * Number.parseFloat(this.cart.amounts[index].toString());
      totalPublicPrice = Number.parseFloat(totalPublicPrice.toString()) + Number.parseFloat(totalPublicPriceProduct.toString());
    }

    this.cart.totalItems = totalItems;
    this.cart.totalPrice = totalPrice;
    this.cart.totalPriceTaxs = totalPublicPrice;

    if (this.cart.amounts[index] == 0) {
      const index: number = this.cart.products.indexOf(product);
      this.cart.products.splice(index, 1);
      this.cart.amounts.splice(index, 1);
    }
    
    this.cacheService.setElement("cart", this.cart);
  }

  /* No Login Modal Actions */
  closeModalGoLogin($event) {

  }

  acceptModalGoLogin($event) {
    this.router.navigateByUrl("/auth/login")
  }
}
