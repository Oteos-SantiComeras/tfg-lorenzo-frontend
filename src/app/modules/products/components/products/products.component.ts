import environment from 'src/environments/environment';
import { Category } from './../../../categories/model/category';
import { cloneDeep } from 'lodash-es';
import { FetchProducts, CreateProduct, EditProduct, DeleteProduct, FetchCategories, UnSubscribeProductsWS, SetImageProduct } from './../../store/products.actions';
import { Product } from './../../model/product';
import { ProductsState } from './../../store/products.state';
import { Component, forwardRef, HostListener, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { OteosAction, OteosBlockItem, OteosCacheService, OteosConstantsService, OteosModalService, OteosSelectedItem, OteosSelectItem, OteosSpinnerService, OteosTableCol, OteosTableItem, OteosThemeService, OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { SubscribeProductsWS } from '../../store/products.actions';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductsComponent),
      multi: true
    }
  ]
})
export class ProductsComponent implements OnInit {

  @Select(ProductsState.products)
  products$: Observable<Product[]>;

  @Select(ProductsState.notifyChangeProducts)
  notifyChangeProducts$: Observable<boolean>;

  @Select(ProductsState.categories)
  categories$: Observable<Category[]>;

  private subManager: Subscription;

  public showMode: string;
  public manageMode: string;
  public totalItemsPage: number;
  public productsList: Product[];
  public cols: OteosTableCol[];
  public tableItems: OteosTableItem<Product>[]; 
  public blockItems: OteosBlockItem<Product>[];
  public newProduct: Product; 
  public productSelected: Product;
  public selectCategories: OteosSelectItem[];
  public selectedImage: any;
  public selectedFile: File;

  public filter: any;

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
    this.cacheService.setElement("title", this.translateService.getTranslate('label.products.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.productsList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newProduct = new Product();
    this.productSelected = new Product();

    this.selectCategories = [];
    this.selectedFile = undefined;
    this.selectedImage = undefined;

    this.filter = {
      code: '',
      name: '',
      category: '',
    };
  }

  ngOnInit() {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.products.cols.code'), property: "code"},
      {label: this.translateService.getTranslate('label.products.cols.name'), property: "name"},
      {label: this.translateService.getTranslate('label.products.cols.category'), property: "category"},    
      {label: this.translateService.getTranslate('label.products.cols.price'), property: "price"},    
      {label: this.translateService.getTranslate('label.products.cols.tax'), property: "tax"},    
      {label: this.translateService.getTranslate('label.products.cols.publicSellPrice'), property: "publicSellPrice"},          
      {label: this.translateService.getTranslate('label.products.cols.stock'), property: "stock"},
    ];

    // Fetch inicial de la DB
    this.store.dispatch(new FetchProducts({filter: this.filter}));
    this.fetchProducts();
    this.notifyChangeProducts();
    this.store.dispatch(new FetchCategories({filter: null}));
    this.fetchCategories();
  }

  /* Store Functions */
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
          this.productsList = this.store.selectSnapshot(ProductsState.products);
          
          this.blockItems = [];
          this.tableItems = [];
          this.createItems(this.productsList);     
          this.spinnerService.showSpinner(); 
        },
        error: (err) => {
          this.spinnerService.hideSpinner();
        },
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  createProduct($ev: Product) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new CreateProduct({ product: $ev })).subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(ProductsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(ProductsState.successMsg),
          );

          this.setProductImage($ev);
         /*  this.notifyChangeProducts();
          this.closeForm(); */
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(ProductsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(ProductsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  editProduct($ev: Product) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new EditProduct({
        code: this.productSelected.code,
        newProduct: $ev,
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(ProductsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(ProductsState.successMsg),
          );

          this.notifyChangeProducts();
          this.closeForm();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(ProductsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(ProductsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  deleteProduct($ev: Product) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeleteProduct({ 
        code: $ev.code 
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(ProductsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(ProductsState.successMsg),
          );

          this.notifyChangeProducts();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(ProductsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(ProductsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  fetchCategories(){
    this.spinnerService.showSpinner();

    const sub = this.categories$.subscribe({
      next: () =>{
        this.selectCategories = [];

        const categories = this.store.selectSnapshot(ProductsState.categories);

        if(categories && categories.length > 0) {
          for (const category of categories) {
            this.selectCategories.push({label: category.name ,value: category});
          }
        }
      }
    });

    this.subManager.add(sub);
    this.spinnerService.hideSpinner();
  }

  setProductImage($ev: Product) {
    this.store.dispatch(new SetImageProduct({ code: $ev.code, file: this.selectedFile })).subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(ProductsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(ProductsState.successMsg),
          );

          this.notifyChangeProducts();
          this.closeForm();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(ProductsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(ProductsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

   // this.spinnerService.showSpinner();
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

  /* Table and Block List Items Create */
  private createItems(products: Product[]) {
    if (products == undefined || products == null) 
      return;
    if (products.length == 0)
      return;

      products.forEach((product, index) =>  {
      let actions: OteosAction<Product>[] = [
        {
          label: this.translateService.getTranslate('label.actions.update'),
          value: 'edit',
          icon : 'fa fa-edit'
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

      let blockItem = new OteosBlockItem<Product>();
      blockItem.item = product;
      blockItem.actions = actions;
      blockItem.borderColor = blockItemBorderColor;

      this.blockItems.push(blockItem);

      let tableItem = new OteosTableItem<Product>();
      tableItem.item = product;
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
  selectItem($event: OteosSelectedItem<Product>) {
    
  }

  onCloseOptions($event) {

  }

  getAction($event) {
    this.productSelected = $event.item;

    if ($event.value == 'edit') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      this.newProduct = cloneDeep(this.productSelected);

      this.newProduct.imageUrl = `${environment.serverUrl}${this.newProduct.code}.jpeg`;

      this.manageMode = 'update';
      this.showMode = 'form';
    }

    if ($event.value == 'delete') {
      this.modalService.open("delete-product");
    }
  } 

  /* Form Actions */
  openForm() {
    this.newProduct = new Product();
    this.productSelected = new Product();
    this.selectedFile = undefined;
    this.selectedImage = undefined;

    this.manageMode = 'new';
    this.showMode = 'form';
  }

  closeForm() {
    this.newProduct = new Product();
    this.productSelected = new Product();
    this.selectedFile = undefined;
    this.selectedImage = undefined;
    
    this.manageMode = '';
    this.changeTableMode();
  }

  onClickFormButon() {
    // Check si hay errores en el formulario
    let errorMsg: string = this.validateDetailFormFields();
    if (errorMsg) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        errorMsg
      );

      return;
    }

    this.newProduct.price = Number.parseFloat(this.newProduct.price.toString());
    this.newProduct.tax = Number.parseFloat(this.newProduct.tax.toString());
    this.newProduct.publicSellPrice = Number.parseFloat(this.newProduct.publicSellPrice.toString());
    this.newProduct.stock = Number.parseFloat(this.newProduct.stock.toString());

    console.log(this.newProduct)

    if (this.manageMode == 'new') {
      this.createProduct(this.newProduct);
    } else {
      this.editProduct(this.newProduct);
    }
  }

  onPriceChange($event) {
    if ($event && $event == true) {
      if (!this.newProduct.price) {
        this.newProduct.price = 0;
      }

      if (!this.newProduct.tax) {
        this.newProduct.tax = 0;
      }

      if (this.newProduct.price == 0 || this.newProduct.tax == 0) {
        this.newProduct.publicSellPrice = 0;
      } else {
        
        const total: number = (Number.parseFloat(this.newProduct.price.toString()) * Number.parseFloat(this.newProduct.tax.toString())) / 100;
        console.log(total)
        const sum: number = Number.parseFloat(this.newProduct.price.toString()) + total;
        console.log(sum)
        this.newProduct.publicSellPrice = Number.parseFloat(sum.toString());
      }

      
    }
  }

  private validateDetailFormFields() {
    if (!this.newProduct.code) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.name) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.category) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.description) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.price) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.tax) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.publicSellPrice) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.newProduct.stock) {
      return this.translateService.getTranslate('label.form.fields');
    }

    if (!this.selectedFile && this.manageMode != 'update') {
      return this.translateService.getTranslate('label.form.fields');
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.productSelected = new Product();
  }

  onConfirmModal($event) {
    let deleteProduct: Product = cloneDeep(this.productSelected);
    this.productSelected = new Product();

    this.deleteProduct(deleteProduct);
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        if (this.showMode != 'form') {
          this.search();
        } else {
          this.onClickFormButon();
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

  /* File Uploader Actions */
  uploadBtn($ev) {
    this.selectedFile = $ev;

    let reader = new FileReader();
    reader.readAsDataURL($ev); 
    reader.onload = (_event) => { 
      this.selectedImage = reader.result;
    }
  }

  cleanBtn($ev) {
    this.selectedFile = undefined;
    this.selectedImage = undefined;
  }

  /* On Destroy Function */
  ngOnDestroy(): void {
   this.subManager.unsubscribe();
   this.store.dispatch(new UnSubscribeProductsWS());
  }

  private _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }

    return bytes.buffer;
  }
}
