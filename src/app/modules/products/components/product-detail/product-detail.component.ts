import { cloneDeep } from 'lodash-es';
import { OteosSpinnerService, OteosCacheService, OteosTranslateService, OteosToastService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../../model/product';
import { ProductsState } from '../../store/products.state';
import { FetchProducts, SubscribeProductsWS } from '../../store/products.actions';
import environment from 'src/environments/environment';
import { Cart } from 'src/app/modules/cart/model/cart';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {

  @Select(ProductsState.products)
  products$: Observable<Product[]>;

  @Select(ProductsState.notifyChangeProducts)
  notifyChangeProducts$: Observable<boolean>;

  private subManager: Subscription;

  public productsList: Product[];
  public productSelected: Product;
  public code: string;

  public filter: any;

  constructor(
    private readonly toastService: OteosToastService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly spinnerService: OteosSpinnerService,
    private readonly cacheService: OteosCacheService,
    public readonly translateService: OteosTranslateService,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.product-detail.cache.title'))
    this.subManager = new Subscription();

    this.productsList = [];
    this.productSelected = undefined;
    this.code = undefined;

    this.filter = {
      code: '',
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => { 
        this.code = params["code"];
    });

    if (!this.code) {
      this.onClickComeBackBtn();
      return;
    }

    this.filter.code = this.code;

    this.store.dispatch(new FetchProducts({filter: this.filter}));
    this.fetchProducts();
    this.notifyChangeProducts();
  }

  /* Store Actions */
  notifyChangeProducts(){
    this.store.dispatch(new SubscribeProductsWS());

    const sub = this.notifyChangeProducts$.subscribe({
      next: () => {
        this.store.dispatch(new FetchProducts({ filter: this.filter}))
      }
    });

    this.subManager.add(sub);
  }

  fetchProducts() {
    this.spinnerService.showSpinner();

    const sub = this.products$.subscribe({
        next: () => {
          this.productsList = [];

          if (this.store.selectSnapshot(ProductsState.products) && this.store.selectSnapshot(ProductsState.products).length > 0) {
            for (const product of this.store.selectSnapshot(ProductsState.products)) {
              let auxProduct = cloneDeep(product);
              auxProduct.imageUrl = `${environment.serverUrl}${product.code}.jpeg`;
              this.productsList.push(auxProduct);
            }

            if (this.productsList && this.productsList.length > 0) {
              this.productSelected = this.productsList[0];
            }
          }
          
          this.spinnerService.hideSpinner(); 
        },
        error: (err) => {
          this.spinnerService.hideSpinner();
        },
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  /* Detail Actions */
  onClickComeBackBtn() {
    this.router.navigateByUrl("/products-list");
  }

  onClickAddToCartItem(item: Product) {
    if (!item) {
      return;
    }

    if (!this.cacheService.getElement("cart")) {
      let newCart: Cart = {
        _id: undefined,
        user: undefined,
        products: [],
        amounts: [],
        totalItems: 0,
        totalPrice: 0,
        totalPriceTaxs: 0
      }
      this.cacheService.setElement("cart", newCart);
    }

    let cart: Cart = this.cacheService.getElement("cart");

    let itemInCart: any = cart.products.find(p => p.code == item.code);

    if (itemInCart) {
      const index: number = cart.products.indexOf(itemInCart);
      cart.amounts[index] = cart.amounts[index] + 1;
    } else {
      cart.products.push(item);
      cart.amounts.push(1);
    }

    let totalItems: number = 0;
    let totalPrice: number = 0;
    let totalPublicPrice: number = 0;
    for (const product of cart.products) {
      const index: number = cart.products.indexOf(product);

      totalItems = Number.parseFloat(totalItems.toString()) + Number.parseFloat(cart.amounts[index].toString());

      let totalPriceProduct: number = 0;
      totalPriceProduct = Number.parseFloat(product.price.toString()) * Number.parseFloat(cart.amounts[index].toString());
      totalPrice = Number.parseFloat(totalPrice.toString()) + Number.parseFloat(totalPriceProduct.toString());

      let totalPublicPriceProduct: number = 0;
      totalPublicPriceProduct = Number.parseFloat(product.publicSellPrice.toString()) * Number.parseFloat(cart.amounts[index].toString());
      totalPublicPrice = Number.parseFloat(totalPublicPrice.toString()) + Number.parseFloat(totalPublicPriceProduct.toString());
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.totalPriceTaxs = totalPublicPrice;

    this.cacheService.setElement("cart", cart);

    this.toastService.addSuccessMessage(
      this.translateService.getTranslate("label.success.title"),
      this.translateService.getTranslate("label.product-detail.add-cart.btn.sucessfully")
    );
  }

  /* On Destroy Function */
  ngOnDestroy(): void {
    
  }
}
