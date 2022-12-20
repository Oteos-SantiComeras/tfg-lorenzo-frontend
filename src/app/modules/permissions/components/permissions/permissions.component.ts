import { cloneDeep } from 'lodash-es';
import { OteosCacheService, OteosToastService, OteosTranslateService, OteosSpinnerService, OteosBlockItem, OteosAction, OteosSelectedItem, OteosTableItem, OteosTableCol, OteosConstantsService, OteosThemeService, OteosModalService } from 'oteos-components-lib';
import { Component, forwardRef, HostListener, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Permission } from '../../model/permission';
import { Observable, Subscription } from 'rxjs';
import { CreatePermission, DeletePermission, EditPermission, FetchPermissions } from '../../store/permissions.actions';
import { PermissionsState } from '../../store/permissions.state';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionsComponent),
      multi: true
    }
  ]
})

export class PermissionsComponent implements OnInit {
  @Select(PermissionsState.permissions)
  permissions$: Observable<Permission[]>;

  @Select(PermissionsState.notifyChangePermissions)
  notifyChangePermission$: Observable<boolean>;

  private subManager: Subscription;

  public showMode: string; // Indica si motrar los elementos en tabla o en block list
  public manageMode: string; // Indicador para el formulario new/update del detalle
  public totalItemsPage: number; // Indicador para el total de elementos por página
  public permissionsList: Permission[]; // Lista de permisos recogida de DB (Fetch)
  public cols: OteosTableCol[]; // Lista de columnas de la tabla
  public tableItems: OteosTableItem<Permission>[]; // Lista para almacenar los items creados para la tabla
  public blockItems: OteosBlockItem<Permission>[]; // Lista para almacenar los items creados para el block list
  public newPermission: Permission; // Objeto para almacenar los datos del formulario del detalle new/update
  public permissionSelected: Permission; // Objeto para almacenar el elemento seleccionado en las acciones de la tabla / block list

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
    this.cacheService.setElement("title", this.translateService.getTranslate('label.permissions.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.permissionsList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newPermission = new Permission();
    this.permissionSelected = new Permission();

    this.filter = {
      name: '',
    };
  }

  ngOnInit(): void {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.permissions.cols.name'), property: "name"}
    ];

    // Fetch inicial de la DB
    this.fetchPermissions();
    this.notifyChangePermissions();
  }

  /* Store Functions */
  notifyChangePermissions(){
    const sub = this.notifyChangePermission$.subscribe({
      next: () => {
        this.store.dispatch(new FetchPermissions({ filter: this.filter}))
      }
    });

    this.subManager.add(sub);
  }

  fetchPermissions() {
    this.spinnerService.showSpinner();

    const sub = this.permissions$.subscribe({
        next: () => {
          this.permissionsList = [];
          this.permissionsList = this.store.selectSnapshot(PermissionsState.permissions);
          
          this.blockItems = [];
          this.tableItems = [];
          this.createItems(this.permissionsList);     
          this.spinnerService.showSpinner(); 
        },
        error: (err) => {
          this.spinnerService.hideSpinner();
        },
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  createPermission($ev: Permission) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new CreatePermission({ permission: $ev.name })).subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(PermissionsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(PermissionsState.successMsg),
          );

          this.notifyChangePermissions();
          this.closeForm();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(PermissionsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(PermissionsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  editPermission($ev: Permission) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new EditPermission({
        oldPermission: this.permissionSelected.name,
        newPermision: $ev,
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(PermissionsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(PermissionsState.successMsg),
          );

          this.notifyChangePermissions();
          this.closeForm();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(PermissionsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(PermissionsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  deletePermission($ev: Permission) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeletePermission({ 
        permission: $ev.name 
      })
    )
    .subscribe({
      next: () => {
        const success: boolean = this.store.selectSnapshot(PermissionsState.success);

        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(PermissionsState.successMsg),
          );

          this.notifyChangePermissions();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(PermissionsState.errorMsg),
          );
        }

        this.spinnerService.showSpinner();
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(PermissionsState.errorMsg),
        );

        this.spinnerService.showSpinner();
      },
    });

    this.spinnerService.showSpinner();
  }

  /* Filter functions */
  search() {
    this.notifyChangePermissions();
    this.fetchPermissions();
  }

  clearFilter() {
    this.filter = {
      name: '',
    };

    this.search();
  }

  /* Table and Block List Items Create */
  private createItems(permissions: Permission[]) {
    if (permissions == undefined || permissions == null) 
      return;
    if (permissions.length == 0)
      return;

      permissions.forEach((permission, index) =>  {
      let actions: OteosAction<Permission>[] = [
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

      let blockItem = new OteosBlockItem<Permission>();
      blockItem.item = permission;
      blockItem.actions = actions;
      blockItem.borderColor = blockItemBorderColor;

      this.blockItems.push(blockItem);

      let tableItem = new OteosTableItem<Permission>();
      tableItem.item = permission;
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
  selectItem($event: OteosSelectedItem<Permission>) {
    
  }

  onCloseOptions($event) {

  }

  getAction($event) {
    this.permissionSelected = $event.item;

    if ($event.value == 'edit') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      this.newPermission = cloneDeep(this.permissionSelected);

      this.manageMode = 'update';
      this.showMode = 'form';
    }

    if ($event.value == 'delete') {
      this.modalService.open("delete-permission");
    }
  } 

  /* Form Actions */
  openForm() {
    this.newPermission = new Permission();
    this.permissionSelected = new Permission();

    this.manageMode = 'new';
    this.showMode = 'form';
  }

  closeForm() {
    this.newPermission = new Permission();
    this.permissionSelected = new Permission();
    
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
      this.createPermission(this.newPermission);
    } else {
      this.editPermission(this.newPermission);
    }
  }

  private validateDetailFormFields() {
    if (!this.newPermission.name) {
      return this.translateService.getTranslate('label.form.fields');
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.permissionSelected = new Permission();
  }

  onConfirmModal($event) {
    let deletedPermission: Permission = cloneDeep(this.permissionSelected);
    this.permissionSelected = new Permission();

    this.deletePermission(deletedPermission);
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
