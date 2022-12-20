import { cloneDeep } from 'lodash-es';
import { FetchCategories, CreateCategory, EditCategory, DeleteCategory } from './../../store/categories.actions';
import { Category } from './../../model/category';
import { CategoriesState } from './../../store/categories.state';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, forwardRef, HostListener, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { OteosAction, OteosBlockItem, OteosCacheService, OteosConstantsService, OteosModalService, OteosSelectedItem, OteosSpinnerService, OteosTableCol, OteosTableItem, OteosThemeService, OteosToastService, OteosTranslateService } from 'oteos-components-lib';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategoriesComponent),
      multi: true
    }
  ]
})
export class CategoriesComponent implements OnInit {
  
  @Select(CategoriesState.categories)
  categories$: Observable<Category[]>;

  @Select(CategoriesState.notifyChangeCategories)
  notifyChangeCategories$: Observable<boolean>;

  private subManager: Subscription;

  public showMode: string;
  public manageMode: string;
  public totalItemsPage: number;
  public categoriesList: Category[];
  public cols: OteosTableCol[];
  public tableItems: OteosTableItem<Category>[]; 
  public blockItems: OteosBlockItem<Category>[];
  public newCategory: Category; 
  public categorySelected: Category;

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
    this.cacheService.setElement("title", this.translateService.getTranslate('label.categories.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.categoriesList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newCategory = new Category();
    this.categorySelected = new Category();

    this.filter = {
      name: '',
    };
  }

  ngOnInit() {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.permissions.cols.name'), property: "name"}
    ];

    // Fetch inicial de la DB
    this.fetchCategories();
    this.notifyChangeCategories();
  }

  /* Store Functions */
  notifyChangeCategories(){
    const sub = this.notifyChangeCategories$.subscribe({
      next: () => {
        this.store.dispatch(new FetchCategories({ filter: this.filter}))
      }
    });

    this.subManager.add(sub);
  }

  fetchCategories() {
    this.spinnerService.showSpinner();

    const sub = this.categories$.subscribe({
        next: () => {
          this.categoriesList = [];
          this.categoriesList = this.store.selectSnapshot(CategoriesState.categories);
          
          this.blockItems = [];
          this.tableItems = [];
          this.createItems(this.categoriesList);     
          this.spinnerService.showSpinner(); 
        },
        error: (err) => {
          this.spinnerService.hideSpinner();
        },
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  createCategory($ev: Category) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new CreateCategory({ category: $ev })).subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(CategoriesState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(CategoriesState.successMsg),
          );

          this.notifyChangeCategories();
          this.closeForm();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(CategoriesState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(CategoriesState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  editCategory($ev: Category) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new EditCategory({
        name: this.categorySelected.name,
        category: $ev,
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(CategoriesState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(CategoriesState.successMsg),
          );

          this.notifyChangeCategories();
          this.closeForm();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(CategoriesState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(CategoriesState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  deleteCategory($ev: Category) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeleteCategory({ 
        name: $ev.name 
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(CategoriesState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(CategoriesState.successMsg),
          );

          this.notifyChangeCategories();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(CategoriesState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(CategoriesState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  /* Filter functions */
  search() {
    this.notifyChangeCategories();
    this.fetchCategories();
  }

  clearFilter() {
    this.filter = {
      name: '',
    };

    this.search();
  }

  /* Table and Block List Items Create */
  private createItems(categories: Category[]) {
    if (categories == undefined || categories == null) 
      return;
    if (categories.length == 0)
      return;

      categories.forEach((category, index) =>  {
      let actions: OteosAction<Category>[] = [
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

      let blockItem = new OteosBlockItem<Category>();
      blockItem.item = category;
      blockItem.actions = actions;
      blockItem.borderColor = blockItemBorderColor;

      this.blockItems.push(blockItem);

      let tableItem = new OteosTableItem<Category>();
      tableItem.item = category;
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
  selectItem($event: OteosSelectedItem<Category>) {
    
  }

  onCloseOptions($event) {

  }

  getAction($event) {
    this.categorySelected = $event.item;

    if ($event.value == 'edit') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      this.newCategory = cloneDeep(this.categorySelected);

      this.manageMode = 'update';
      this.showMode = 'form';
    }

    if ($event.value == 'delete') {
      this.modalService.open("delete-category");
    }
  } 

   /* Form Actions */
   openForm() {
    this.newCategory = new Category();
    this.categorySelected = new Category();

    this.manageMode = 'new';
    this.showMode = 'form';
  }

  closeForm() {
    this.newCategory = new Category();
    this.categorySelected = new Category();
    
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

    if (this.manageMode == 'new') {
      this.createCategory(this.newCategory);
    } else {
      this.editCategory(this.newCategory);
    }
  }

  private validateDetailFormFields() {
    if (!this.newCategory.name) {
      return this.translateService.getTranslate('label.form.fields');
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.categorySelected = new Category();
  }

  onConfirmModal($event) {
    let deleteCategory: Category = cloneDeep(this.categorySelected);
    this.categorySelected = new Category();

    this.deleteCategory(deleteCategory);
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

  /* On Destroy Function */
  ngOnDestroy(): void {
   this.subManager.unsubscribe();
  }
}
