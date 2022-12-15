import { Category } from './../../categories/model/category';
import { CreateProduct, DeleteProduct, EditProduct, FetchCategories, FetchProducts, SetImageProduct, SubscribeProductsWS, UnSubscribeProductsWS } from './products.actions';
import { ProductsService } from './../products.service';
import { OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from '../../../models/pagination';
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap } from "rxjs/operators";
import { Product } from '../model/product';

export class ProductsStateModel {
  products: Product[];
  categories: Category[];
  success: boolean;
  notifyChangeProducts: boolean;
  errorMsg: string;
  successMsg: string;
}

export const ProductsStateDefault: ProductsStateModel = {
  products: [],
  categories: [],
  success: false,
  notifyChangeProducts: false,
  errorMsg: '',
  successMsg: '',
};

@State<ProductsStateModel>({
  name: "products",
  defaults: ProductsStateDefault,
})

@Injectable()
export class ProductsState {

  constructor(
    private readonly translateService: OteosTranslateService,
    private readonly productsService: ProductsService,
  ) {
    
  }

  @Selector()
  static products(state: ProductsStateModel): Product[] {
    return state.products;
  }

  @Selector()
  static categories(state: ProductsStateModel): Category[] {
    return state.categories;
  }

  @Selector()
  static success(state: ProductsStateModel): boolean {
    return state.success;
  }
  @Selector()
  static notifyChangeProducts(state: ProductsStateModel): boolean {
    return state.notifyChangeProducts;
  }

  @Selector()
  static errorMsg(state: ProductsStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: ProductsStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchProducts)
  public fetchProducts (
    { patchState }: StateContext<ProductsStateModel>,
    { payload }: FetchProducts
  ) {
    return this.productsService.fetchProducts(payload.filter).pipe(
      map((pagination: Pagination) => {
        const products: any[] = pagination.items;
        patchState({
          products: products
        });
      })
    );
  }

  @Action(CreateProduct)
  public createProduct(
    { patchState }: StateContext<ProductsStateModel>,
    { payload }: CreateProduct
  ) {
    return this.productsService.createProduct(payload.product).pipe(
      tap((product: Product) => {
        if (product) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.products.create.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.products.create.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Product " + payload.product.code + " already exist")) {
          errorMSg = this.translateService.getTranslate('label.products.create.already.exist');
        } else if (err.error.message == ("Category " + payload.product.category.name + " not exist")) {
          errorMSg = this.translateService.getTranslate('label.products.create.category.not.exist');
        } else {
          errorMSg = this.translateService.getTranslate('label.products.create.error');
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

  @Action(EditProduct)
  public editProduct(
    { patchState }: StateContext<ProductsStateModel>,
    { payload }: EditProduct
  ) {
    return this.productsService
      .editProduct(payload.code, payload.newProduct)
      .pipe(
        tap((product: Product) => {
          if (product) {
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.products.update.success'),
            });
          } else {
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.products.update.error'),
              successMsg: '',
            });
          }
        }),
        catchError((err) => {
          let errorMSg: string = '';
          if (err.error.message == ("Product " + payload.code + " not found")) {
            errorMSg = this.translateService.getTranslate('label.products.update.not.found');
          } else if (err.error.message == ("Category " + payload.newProduct.category.name + " not exist")) {
            errorMSg = this.translateService.getTranslate('label.products.update.category.not.exist');
          } else {
            errorMSg = this.translateService.getTranslate('label.products.update.error');
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

  @Action(DeleteProduct)
  deleteProduct(
    { patchState }: StateContext<ProductsStateModel>,
    { payload }: DeleteProduct
  ) {
    return this.productsService.deleteProduct(payload.code)
      .pipe(tap((res: boolean) => {
        if (res) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.products.delete.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.products.delete.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Product " + payload.code + " not found")) {
          errorMSg = this.translateService.getTranslate('label.products.delete.not.found');
        } else {
          errorMSg = this.translateService.getTranslate('label.products.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });
      
        throw new Error(err);
      }));
  }

  @Action(SetImageProduct)
  public setImageProduct(
    { patchState }: StateContext<ProductsStateModel>,
    { payload }: SetImageProduct
  ) {
    return this.productsService.setImageProduct(payload.code, payload.file).pipe(
      tap((res: boolean) => {
        if (res) {
          patchState({
            success: res,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.products.setImage.success'),
          });
        } else {
          patchState({
            success: res,
            errorMsg: this.translateService.getTranslate('label.products.setImage.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = this.translateService.getTranslate('label.products.setImage.error');

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });

        throw new Error(err);
      })
    );
  }

  @Action(FetchCategories)
  public fetchCategories (
    { patchState }: StateContext<ProductsStateModel>,
    { payload }: FetchCategories
  ) {
    return this.productsService.fetchCategories(payload.filter).pipe(
      map((pagination: Pagination) => {
        const categories: any[] = pagination.items;
        patchState({
          categories: categories
        });
      })
    );
  }

  @Action(SubscribeProductsWS)
  public subscribeProductsWS(ctx: StateContext<ProductsStateModel>) {
    return this.productsService.getProductsBySocket().pipe(
      map((change: boolean) => {
        if(change){
        let state = ctx.getState();
        state = {
          ...state,
          notifyChangeProducts: !state.notifyChangeProducts,
        };
        ctx.setState({
          ...state,
        });
      }
      })
    )
  }

  @Action(UnSubscribeProductsWS)
  public unSubscribeProductsWS(ctx: StateContext<ProductsStateModel>) {
    this.productsService.removeSocket();
  }
}

