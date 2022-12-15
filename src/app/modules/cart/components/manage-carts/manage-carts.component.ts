import environment from 'src/environments/environment';
import { FetchUsers } from './../../../users/store/users.actions';
import { User } from './../../../users/model/user';
import { UsersState } from './../../../users/store/users.state';
import { cloneDeep } from 'lodash-es';
import { FetchCarts, CreateCart, EditCart, DeleteCart, UnSubscribeCartsWS } from './../../store/cart.actions';
import { Cart } from './../../model/cart';
import { CartsState } from './../../store/cart.state';
import { Select, Store } from '@ngxs/store';
import { Component, forwardRef, HostListener, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { OteosAction, OteosBlockItem, OteosCacheService, OteosConstantsService, OteosModalService, OteosSelectedItem, OteosSelectItem, OteosSpinnerService, OteosTableCol, OteosTableItem, OteosThemeService, OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { SubscribeCartsWS } from '../../store/cart.actions';
import { Product } from 'src/app/modules/products/model/product';

@Component({
  selector: 'app-manage-carts',
  templateUrl: './manage-carts.component.html',
  styleUrls: ['./manage-carts.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ManageCartsComponent),
      multi: true
    }
  ]
})
export class ManageCartsComponent implements OnInit {

  @Select(CartsState.carts)
  carts$: Observable<Cart[]>;

  @Select(CartsState.notifyChangeCarts)
  notifyChangeCarts$: Observable<boolean>;

  @Select(UsersState.users)
  users$: Observable<User[]>;

  private subManager: Subscription;

  public showMode: string;
  public manageMode: string;
  public totalItemsPage: number;
  public cartsList: Cart[];
  public cols: OteosTableCol[];
  public tableItems: OteosTableItem<Cart>[]; 
  public blockItems: OteosBlockItem<Cart>[];
  public newCart: Cart; 
  public cartSelected: Cart;
  public selectUsers: OteosSelectItem[];

  public filter: any;

  public serverUrl: string;

  constructor(
    private readonly modalService: OteosModalService,
    private readonly themeService: OteosThemeService,
    private readonly cacheService: OteosCacheService,
    public readonly translateService: OteosTranslateService,
    private readonly spinnerService: OteosSpinnerService,
    private readonly toastService: OteosToastService,
    public readonly constantsService: OteosConstantsService,
    private readonly store: Store,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.manage-carts.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.cartsList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newCart = new Cart();
    this.cartSelected = new Cart();
    this.selectUsers = [];

    this.filter = {
      user: '',
      _id: '',
    };

    this.serverUrl = environment.serverUrl;
  }

  ngOnInit() {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.manage-carts.cols.id'), property: "_id"},
      {label: this.translateService.getTranslate('label.manage-carts.cols.name'), property: "user"},
      {label: this.translateService.getTranslate('label.manage-carts.cols.totalItems'), property: "totalItems"},
      {label: this.translateService.getTranslate('label.manage-carts.cols.totalPrice'), property: "totalPrice"},
      {label: this.translateService.getTranslate('label.manage-carts.cols.totalPriceTaxs'), property: "totalPriceTaxs"},
    ];

    // Fetch inicial de la DB
    this.fetchCarts();
    this.notifyChangeCarts();
    this.store.dispatch(new FetchUsers({filter: null}));
    this.fetchUsers();
  }

  /* Store Functions */
  notifyChangeCarts(){
    this.store.dispatch(new SubscribeCartsWS());

    const sub = this.notifyChangeCarts$.subscribe({
      next: () => {
        this.store.dispatch(new FetchCarts({ filter: this.filter}))
      }
    });

    this.subManager.add(sub);
  }

  fetchCarts() {
    this.spinnerService.showSpinner();

    const sub = this.carts$.subscribe({
      next: () => {
        this.cartsList = [];
        this.cartsList = this.store.selectSnapshot(CartsState.carts);
        
        this.blockItems = [];
        this.tableItems = [];
        this.createItems(this.cartsList);     
        this.spinnerService.showSpinner(); 
      },
      error: (err) => {
        this.spinnerService.hideSpinner();
      },
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  deleteCart($ev: Cart) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeleteCart({ 
        _id: $ev._id
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(CartsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(CartsState.successMsg),
          );

          this.notifyChangeCarts();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(CartsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(CartsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  fetchUsers(){
    this.spinnerService.showSpinner();

    const sub = this.users$.subscribe({
      next: () =>{
        this.selectUsers = [];

        const users = this.store.selectSnapshot(UsersState.users);
        console.log(users)

        if(users && users.length > 0) {
          for (const user of users) {
            this.selectUsers.push({label: user.userName ,value: user});
          }
        }
      }
    });

    this.subManager.add(sub);
    this.spinnerService.hideSpinner();
  }

  /* Filter functions */
  search() {
    this.notifyChangeCarts();
    this.fetchCarts();
  }

  clearFilter() {
    this.filter = {
      user: '',
      _id: '',
    };

    this.search();
  }

  /* Table and Block List Items Create */
  private createItems(carts: Cart[]) {
    if (carts == undefined || carts == null) 
      return;
    if (carts.length == 0)
      return;

      carts.forEach((cart, index) =>  {
      let actions: OteosAction<Cart>[] = [
        {
          label: this.translateService.getTranslate('label.actions.view'),
          value: 'view',
          icon : 'fa fa-eye'
        },
        {
          label: this.translateService.getTranslate('label.actions.delete'),
          value : 'delete',
          icon: 'fa fa-trash'
        }
      ];

      let blockItemBorderColor: string = '#343a40'; // Theme-Default
      if (this.themeService.theme == 'theme-dark') {
        blockItemBorderColor = '#f8f9fa';
      } else if (this.themeService.theme == 'theme-blue') {
        blockItemBorderColor = '#002c77';
      }

      let blockItem = new OteosBlockItem<Cart>();
      blockItem.item = cart;
      blockItem.actions = actions;
      blockItem.borderColor = blockItemBorderColor;

      this.blockItems.push(blockItem);

      let tableItem = new OteosTableItem<Cart>();
      tableItem.item = cart;
      tableItem.actions = actions;
      tableItem.index = index;

      this.tableItems.push(tableItem);
    }); 
  }

  /* Change Data View (Table / Block list) */
  changeTableMode() {
    this.totalItemsPage = 8;
    this.showMode = 'table';
  }

  changeBlockListMode() {
    this.totalItemsPage = 5;
    this.showMode = 'block-list';
  }

  /* Table and Block list Functions */ 
  selectItem($event: OteosSelectedItem<Cart>) {
    
  }

  onCloseOptions($event) {

  }

  getAction($event) {
    this.cartSelected = $event.item;

    if ($event.value == 'view') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      this.newCart = cloneDeep(this.cartSelected);
      this.newCart.user = this.selectUsers.find(s => s.label == this.newCart.user.userName).value;
      this.manageMode = 'update';
      this.showMode = 'form';
    }

    if ($event.value == 'delete') {
      this.modalService.open("delete-cart");
    }
  } 

   /* Form Actions */
   openForm() {
    this.newCart = new Cart();
    this.cartSelected = new Cart();

    this.manageMode = 'new';
    this.showMode = 'form';
  }

  closeForm() {
    this.newCart = new Cart();
    this.cartSelected = new Cart();
    
    this.manageMode = '';
    this.changeTableMode();
  }

  getTotalPriceWithTaxsOfProduct(product: Product, amount: number) {
    if (!product || !amount) {
      return undefined;
    }

    const productPrice: number = product.price;
    const totalProductPrice: number = Number.parseFloat(productPrice.toString()) * Number.parseFloat(amount.toString());
    const taxSum: number = (Number.parseFloat(totalProductPrice.toString()) * 21) / 100;

    return (Number.parseFloat(totalProductPrice.toString()) + Number.parseFloat(taxSum.toString()));
  }

  private validateDetailFormFields() {
    if (!this.newCart.user) {
      return this.translateService.getTranslate('label.form.fields');
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.cartSelected = new Cart();
  }

  onConfirmModal($event) {
    let deleteCart: Cart = cloneDeep(this.cartSelected);
    this.cartSelected = new Cart();

    this.deleteCart(deleteCart);
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        if (this.showMode != 'form') {
          this.search();
        } else {
        }
        break;
      case 'Escape':
        if (this.showMode != 'form') {
          this.clearFilter();
        } else {
          this.closeForm();
        }
        break;
      case '+':
        if (this.showMode != 'form') {
          this.openForm();
        } else {

        }
        break;
      case 'º':
        if (this.showMode != 'form') {
          if (this.showMode == 'block-list') {
            this.changeTableMode();
          } else {
            this.changeBlockListMode();
          }
        }
        break;
      default:
        break;
    }
  }

  /* On Destroy Function */
  ngOnDestroy(): void {
   this.subManager.unsubscribe();
   this.store.dispatch(new UnSubscribeCartsWS());
  }
}
