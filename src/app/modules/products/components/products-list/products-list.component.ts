import { Category } from './../../../categories/model/category';
import { FetchCategories } from './../../store/products.actions';
import { Cart } from './../../../cart/model/cart';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import { Component, forwardRef, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { OteosCacheService, OteosConstantsService, OteosSpinnerService, OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { Observable, Subscription } from 'rxjs';
import { Product } from '../../model/product';
import { FetchProducts } from '../../store/products.actions';
import { ProductsState } from '../../store/products.state';
import environment from 'src/environments/environment';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductsListComponent),
      multi: true
    }
  ]
})
export class ProductsListComponent implements OnInit {

  @Select(ProductsState.categories)
  categories$: Observable<Category[]>;

  @Select(ProductsState.products)
  products$: Observable<Product[]>;

  @Select(ProductsState.notifyChangeProducts)
  notifyChangeProducts$: Observable<boolean>;

  private subManager: Subscription;

  public categoriesList: Category[];
  public productsList: Product[];
  public productSelected: Product;

  public filter: any;

  public itemsPerPage: number = 12;
  public page: number = 1;

  constructor(
    private readonly cacheService: OteosCacheService,
    public readonly translateService: OteosTranslateService,
    private readonly spinnerService: OteosSpinnerService,
    private readonly toastService: OteosToastService,
    public readonly constantsService: OteosConstantsService,
    private readonly store: Store,
    private readonly router: Router,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.products-list.cache.title'))
    this.subManager = new Subscription();

    this.categoriesList = [];
    this.productsList = [];
    this.productSelected = new Product();

    this.filter = {
      code: '',
      name: '',
      category: undefined,
    };
  }

  ngOnInit() {
    this.store.dispatch(new FetchProducts({filter: this.filter}));
    this.fetchProducts();
    this.notifyChangeProducts();
    this.store.dispatch(new FetchCategories({filter: undefined}));
    this.fetchCategories();
  }

  /* Store Actions */
  notifyChangeProducts(){
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

  fetchCategories(){
    this.spinnerService.showSpinner();

    const sub = this.categories$.subscribe({
      next: () =>{
        this.categoriesList = [];

        const categories = this.store.selectSnapshot(ProductsState.categories);
        this.categoriesList = categories;
      }
    });

    this.subManager.add(sub);
    this.spinnerService.hideSpinner();
  }

  /* Filter functions */
  search() {
    this.notifyChangeProducts();
    this.fetchProducts();
  }

  clearFilter() {
    this.filter = {
      code: '',
      name: '',
      category: '',
    };

    this.search();
  }

  /* Product List Actions */
  onClickAddToCartBtn(item: Product) {
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
      this.translateService.getTranslate("label.products-list.add-cart.btn.sucessfully")
    );
  }

  onClickGoToProductDetail(item: Product) {
    if (!item || !item.code) {
      return;
    }

    this.router.navigate(['/product-detail', item.code] ); 
  }

  onClickGoSignUp() {
    this.router.navigateByUrl("/users/register")
  }
}
