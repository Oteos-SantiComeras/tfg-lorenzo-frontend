import { cloneDeep } from 'lodash-es';
import { FetchCarts } from './../../../cart/store/cart.actions';
import { FetchOrders, DeleteOrder } from './../../store/orders.actions';
import environment from 'src/environments/environment';
import { Cart } from 'src/app/modules/cart/model/cart';
import { CartsState } from './../../../cart/store/cart.state';
import { Order } from './../../model/order';
import { OrdersState } from './../../store/orders.state';
import { Select, Store } from '@ngxs/store';
import { Component, HostListener, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OteosAction, OteosBlockItem, OteosCacheService, OteosConstantsService, OteosModalService, OteosSelectedItem, OteosSpinnerService, OteosTableCol, OteosTableItem, OteosThemeService, OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { Product } from 'src/app/modules/products/model/product';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  @Select(OrdersState.orders)
  orders$: Observable<Order[]>;

  @Select(OrdersState.notifyChangeOrders)
  notifyChangeOrders$: Observable<boolean>;

  @Select(CartsState.carts)
  carts$: Observable<Cart[]>;

  private subManager: Subscription;

  public showMode: string;
  public manageMode: string;
  public totalItemsPage: number;
  public ordersList: Order[];
  public cols: OteosTableCol[];
  public tableItems: OteosTableItem<Order>[]; 
  public blockItems: OteosBlockItem<Order>[];
  public newOrder: Order; 
  public orderSelected: Order;
  public cartsList: Cart[];

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
    this.cacheService.setElement("title", this.translateService.getTranslate('label.manage-orders.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.ordersList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newOrder = new Order();
    this.orderSelected = new Order();
    this.cartsList = [];

    this.filter = {
      _id: '',
      name: '',
      secondName: '',
      email: '',
      country: '',
      address: '',
      zipCode: '',
    };

    this.serverUrl = environment.serverUrl;
  }

  ngOnInit() {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.manage-orders.cols.id'), property: "_id"}, 
      {label: this.translateService.getTranslate('label.manage-orders.cols.paidOut'), property: "paidOut"},
      {label: this.translateService.getTranslate('label.manage-orders.cols.name'), property: "name"},
      {label: this.translateService.getTranslate('label.manage-orders.cols.secondName'), property: "secondName"},
      {label: this.translateService.getTranslate('label.manage-orders.cols.email'), property: "email"},
      {label: this.translateService.getTranslate('label.manage-orders.cols.phone'), property: "phone"},   
      {label: this.translateService.getTranslate('label.manage-orders.cols.country'), property: "country"},
      {label: this.translateService.getTranslate('label.manage-orders.cols.address'), property: "address"},
      {label: this.translateService.getTranslate('label.manage-orders.cols.zipCode'), property: "zipCode"},
    ];

    // Fetch inicial de la DB
    this.fetchOrders();
    this.notifyChangeOrders();

    this.store.dispatch(new FetchCarts({filter: null}));
    this.fetchCarts();
  }

  /* Store Functions */
  notifyChangeOrders(){
    const sub = this.notifyChangeOrders$.subscribe({
      next: () => {
        this.store.dispatch(new FetchOrders({ filter: this.filter}))
      }
    });

    this.subManager.add(sub);
  }

  fetchOrders() {
    this.spinnerService.showSpinner();

    const sub = this.carts$.subscribe({
      next: () => {
        this.ordersList = [];
        this.ordersList = this.store.selectSnapshot(OrdersState.orders);
        
        this.blockItems = [];
        this.tableItems = [];
        this.createItems(this.ordersList);     
        this.spinnerService.showSpinner(); 
      },
      error: (err) => {
        this.spinnerService.hideSpinner();
      },
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  deleteOrder($ev: Order) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeleteOrder({ 
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

          this.notifyChangeOrders();
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

  fetchCarts(){
    this.spinnerService.showSpinner();

    const sub = this.carts$.subscribe({
      next: () =>{
        this.cartsList = [];

        const carts = this.store.selectSnapshot(CartsState.carts);
        if (carts && carts.length > 0) {
          this.cartsList = carts;
        }
        
      }
    });

    this.subManager.add(sub);
    this.spinnerService.hideSpinner();
  }

  /* Filter functions */
  search() {
    this.fetchOrders();
    this.notifyChangeOrders();
  }

  clearFilter() {
    this.filter = {
      _id: '',
      name: '',
      secondName: '',
      email: '',
      country: '',
      address: '',
      zipCode: '',
    };

    this.search();
  }

  /* Table and Block List Items Create */
  private createItems(orders: Order[]) {
    if (orders == undefined || orders == null) 
      return;
    if (orders.length == 0)
      return;

      orders.forEach((order, index) =>  {
      let actions: OteosAction<Order>[] = [
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

      let blockItem = new OteosBlockItem<Order>();
      blockItem.item = order;
      blockItem.actions = actions;
      blockItem.borderColor = blockItemBorderColor;

      this.blockItems.push(blockItem);

      let tableItem = new OteosTableItem<Order>();
      tableItem.item = order;
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
    this.orderSelected = $event.item;

    if ($event.value == 'view') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      this.newOrder = cloneDeep(this.orderSelected);
      console.log(this.newOrder);
      this.manageMode = 'update';
      this.showMode = 'form';
    }

    if ($event.value == 'delete') {
      this.modalService.open("delete-order");
    }
  } 
  
   /* Form Actions */
   openForm() {
    this.newOrder = new Order();
    this.orderSelected = new Order();

    this.manageMode = 'new';
    this.showMode = 'form';
  }

  closeForm() {
    this.newOrder = new Order();
    this.orderSelected = new Order();
    
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
    if (!this.newOrder.name) {
      return this.translateService.getTranslate('label.form.fields');
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.orderSelected = new Order();
  }

  onConfirmModal($event) {
    let deleteOrder: Order = cloneDeep(this.orderSelected);
    this.orderSelected = new Order();

    this.deleteOrder(deleteOrder);
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
  }
}

