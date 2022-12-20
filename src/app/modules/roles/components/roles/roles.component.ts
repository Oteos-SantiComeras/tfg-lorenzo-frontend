import { cloneDeep } from 'lodash-es';
import { Component, forwardRef, HostListener, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { OteosAction, OteosBlockItem, OteosCacheService, OteosConstantsService, OteosSelectedItem, OteosSelectItem, OteosSpinnerService, OteosTableCol, OteosTableItem, OteosToastService, OteosTranslateService, OteosThemeService, OteosModalService, OteosResolutionService } from 'oteos-components-lib';
import { Observable, Subscription } from 'rxjs';
import { Permission } from 'src/app/modules/permissions/model/permission';
import { Role } from '../../model/role';
import { AddRole, DeleteRole, FetchPermissions, FetchRoles, UpdateRole } from '../../store/roles.actions';
import { RoleState } from '../../store/roles.state';
import { OteosJoinPipe } from 'oteos-components-lib';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RolesComponent),
      multi: true
    }
  ]
})

export class RolesComponent implements OnInit {

  @Select(RoleState.roles)
  roles$: Observable<Role[]>;
  @Select(RoleState.permissions)
  permissions$: Observable<Permission[]>;
  @Select(RoleState.notifyChangeRoles)
  notifyChangeRoles$: Observable<boolean>;

  private pipe: OteosJoinPipe = new OteosJoinPipe();
  private subManager: Subscription;

  public showMode: string; // Indica si motrar los elementos en tabla o en block list
  public manageMode: string; // Indicador para el formulario new/update del detalle
  public totalItemsPage: number; // Indicador para el total de elementos por página
  public rolesList: Role[]; // Lista de roles recogida de DB (Fetch)
  public cols: OteosTableCol[]; // Lista de columnas de la tabla
  public tableItems: OteosTableItem<Role>[]; // Lista para almacenar los items creados para la tabla
  public blockItems: OteosBlockItem<Role>[]; // Lista para almacenar los items creados para el block list
  public newRole: Role; // Objeto para almacenar los datos del formulario del detalle new/update
  public roleSelected: Role; // Objeto para almacenar el elemento seleccionado en las acciones de la tabla / block list
  public selectPermissions: OteosSelectItem[]; // Lista de permisos seleccionables para dropdown

  public filter: any;

  /* Own Roles Variables */
  public rowCont: number;

  constructor(
    public readonly resolutionService: OteosResolutionService,
    private readonly modalService: OteosModalService,
    private readonly themeService: OteosThemeService,
    private readonly cacheService: OteosCacheService,
    public readonly translateService: OteosTranslateService,
    private readonly spinnerService: OteosSpinnerService,
    private readonly toastService: OteosToastService,
    public readonly constantsService: OteosConstantsService,
    private readonly store: Store,
  ) {
    this.cacheService.setElement("title", this.translateService.getTranslate('label.roles.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.rolesList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newRole = new Role();
    this.newRole.permissions = [];
    this.roleSelected = new Role();
    this.selectPermissions = [];

    this.filter = {
      name: '',
    }

    this.rowCont = 0;
   }

  ngOnInit() {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.roles.cols.name'), property: "name"},
      {label: this.translateService.getTranslate('label.roles.cols.permissions'), property: "permissions"}
    ];

    this.store.dispatch(new FetchPermissions());
    this.fetchPermissions();
    this.notifyChangeRoles();
    this.fetchRoles();
  }

  /* Store Functions */
  notifyChangeRoles(){
    this.spinnerService.showSpinner();

    const sub = this.notifyChangeRoles$.subscribe({
      next: () => {
        this.store.dispatch(new FetchRoles({filter: this.filter}))
      }
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  fetchRoles() {
    this.spinnerService.showSpinner();

    const sub = this.roles$.subscribe(() => {
      this.rolesList = [];
      this.rolesList = this.store.selectSnapshot(RoleState.roles);

      this.blockItems = [];
      this.tableItems = [];
      this.createItems(this.rolesList);
    }, error => {
      this.spinnerService.hideSpinner();
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  fetchPermissions() {
    this.spinnerService.showSpinner();

    const sub =this.permissions$.subscribe(() => {
      const permissions = this.store.selectSnapshot(RoleState.permissions);
      this.selectPermissions = [];

      if (permissions && permissions.length > 0) {
        for (const p of permissions) {
          this.selectPermissions.push({ label: p.name, value: p });
        }
      }
    }, error => {
      this.spinnerService.hideSpinner();
    });

    this.subManager.add(sub);

    this.spinnerService.hideSpinner();
  }

  createRole(role: Role) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new AddRole({ role })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(RoleState.success);
        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(RoleState.successMsg),
          );

          this.closeForm();
          this.notifyChangeRoles();
        } else {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(RoleState.errorMsg),
          );
        }
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(RoleState.errorMsg),
        );

        this.spinnerService.hideSpinner();
      },
    });

    this.spinnerService.hideSpinner();
  }

  editRole(role: Role) {
    this.spinnerService.showSpinner();

    this.store
      .dispatch(new UpdateRole({ oldName: this.roleSelected.name, role }))
      .subscribe({
        next: () => {
          const success = this.store.selectSnapshot(RoleState.success);
          if (success) {
            this.toastService.addSuccessMessage(
              this.translateService.getTranslate("label.success.title"),
              this.store.selectSnapshot(RoleState.successMsg),
            );

            this.closeForm();
            this.notifyChangeRoles();
          } else {
            this.toastService.addErrorMessage(
              this.translateService.getTranslate("label.error.title"),
              this.store.selectSnapshot(RoleState.errorMsg),
            );
          }
        },
        error: (err) => {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(RoleState.errorMsg),
          );

          this.spinnerService.hideSpinner();
        },
      });

      this.spinnerService.hideSpinner();
  }

  deleteRole(role: Role) {
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeleteRole({ name: role.name })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(RoleState.success);
        if (success) {
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.store.selectSnapshot(RoleState.successMsg),
          );
          this.notifyChangeRoles();
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.store.selectSnapshot(RoleState.errorMsg),
          );
        }
      },
      error: (err) => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.store.selectSnapshot(RoleState.errorMsg),
        );

        this.spinnerService.hideSpinner();
      },
    });

    this.spinnerService.hideSpinner();
  }

  /* Filter functions */
  search() {
    this.notifyChangeRoles();
    this.fetchRoles();
  }

  clearFilter() {
    this.filter = {
      name: '',
    };

    this.search();
  }

  /* Table and Block List Items Create */
  private createItems(roles: Role[]) {
    if (roles == undefined || roles == null) 
      return;
    if (roles.length == 0)
      return;

      roles.forEach((role, index) =>  {
        let actions: OteosAction<Role>[] = [
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

        /* Hacer un objeto "custom" para poder listar los objetos permisos sin '[Object] [Object]' */
        // Hago lista de de strings de los valores a listar para pasarselos al pipe
        let rolePermissions: string[] = [];
        role.permissions.forEach(element => {
          rolePermissions.push(element.name);
        });
        let roleDto: any = {
          name: role.name, 
          permissions: this.pipe.transform(rolePermissions, ", ")
        };
        /* */

        let blockItemBorderColor: string = '#343a40'; // Theme-Default
        if (this.themeService.theme == 'theme-dark') {
          blockItemBorderColor = '#f8f9fa';
        } else if (this.themeService.theme == 'theme-blue') {
          blockItemBorderColor = '#002c77';
        }

        /* Convierto el blockItem y TableItem de OteosBlockItem<Role>() a OteosBlockItem<any>() para pasarle el objeto Role modificado */
        let blockItem = new OteosBlockItem<any>();
        /* Le paso al blockItem.item y TableItem.item el roleDto customizado en vez del role por defecto */
        blockItem.item = roleDto;
        blockItem.actions = actions;
        blockItem.borderColor = blockItemBorderColor;

        this.blockItems.push(blockItem);

        /* Convierto el blockItem y TableItem de OteosBlockItem<Role>() a OteosBlockItem<any>() para pasarle el objeto Role modificado */
        let tableItem = new OteosTableItem<any>();
        /* Le paso al blockItem.item y TableItem.item el roleDto customizado en vez del role por defecto */
        tableItem.item = roleDto;
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
  selectItem($event: OteosSelectedItem<Role>) {
    
  }

  onCloseOptions($event) {

  }

  getAction($event) {
    this.roleSelected = $event.item;

    if ($event.value == 'edit') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      //this.newRole = cloneDeep(this.roleSelected);
      this.newRole.name = this.roleSelected.name;
      this.newRole.permissions = [];

      /* Descompongo la cadena de permisos generada antes para TableItem y BlockList Item */
      let stringPermissions: string = $event.item.permissions;
      let list:any[] = stringPermissions.split(", ");

      /* Comparo los permisos de la cadena de permisos del objeto, con los disponibles para seleccionar y los añado */
      this.selectPermissions.forEach(p => {
        if (list.includes(p.value.name)) {
          this.newRole.permissions.push(p.value);
        }
      });

      this.manageMode = 'update';
      this.showMode = 'form';
    }
    if ($event.value == 'delete') {
      this.modalService.open("delete-role");
    }
  } 

  /* Form Actions */
  openForm() {
    this.newRole = new Role();
    this.newRole.permissions = [];
    this.roleSelected = new Role();

    this.manageMode = 'new';
    this.showMode = 'form';
  }

  closeForm() {
    this.newRole = new Role();
    this.newRole.permissions = [];
    this.roleSelected = new Role();
    
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
      this.createRole(this.newRole);
    } else {
      this.editRole(this.newRole);
    }
  }

  onClickPermissionCheck($event, permissionSelected: OteosSelectItem) {
    if ($event.target.checked) {
      this.newRole.permissions.push(permissionSelected.value);
    } else {
      let indexOfPermission: number = this.newRole.permissions.indexOf(permissionSelected.value);

      if (indexOfPermission && indexOfPermission > -1) {
        this.newRole.permissions.splice(indexOfPermission, 1);
      }
      if (parseInt(indexOfPermission.toString()) == 0) {
        this.newRole.permissions.splice(parseInt(indexOfPermission.toString()), 1)
      }
    }
  }

  private validateDetailFormFields() {
    if (!this.newRole.name) {
      return this.translateService.getTranslate('label.form.fields');
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.roleSelected = new Role();
  }

  onConfirmModal($event) {
    let deletedRole: Role = cloneDeep(this.roleSelected);
    this.roleSelected = new Role();

    this.deleteRole(deletedRole);
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