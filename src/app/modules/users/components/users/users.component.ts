import { cloneDeep } from 'lodash-es';
import { Role } from './../../../roles/model/role';
import { Component, forwardRef, HostListener, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../model/user';
import { UsersState } from '../../store/users.state';
import { OteosAction, OteosBlockItem, OteosCacheService, OteosConstantsService, OteosSelectedItem, OteosSelectItem, OteosSpinnerService, OteosTableCol, OteosTableItem, OteosToastService, OteosTranslateService, OteosThemeService, OteosModalService } from 'oteos-components-lib';
import { AddNewUser, DeleteUser, EditUser, FetchRoles, FetchUsers} from '../../store/users.actions';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { roleList } from 'src/app/constants/roles.constants';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UsersComponent),
      multi: true
    }
  ]
})

export class UsersComponent implements OnInit {

  @Select(UsersState.users)
  users$: Observable<User[]>;
  @Select(UsersState.roles)
  roles$: Observable<Role[]>;
  @Select(UsersState.notifyChangeUsers)
  notifyChangeUsers$: Observable<boolean>;

  private subManager: Subscription;

  public showMode: string; // Indica si motrar los elementos en tabla o en block list
  public manageMode: string; // Indicador para el formulario new/update del detalle
  public totalItemsPage: number; // Indicador para el total de elementos por página
  public usersList: User[]; // Lista de roles recogida de DB (Fetch)
  public cols: OteosTableCol[]; // Lista de columnas de la tabla
  public tableItems: OteosTableItem<User>[]; // Lista para almacenar los items creados para la tabla
  public blockItems: OteosBlockItem<User>[]; // Lista para almacenar los items creados para el block list
  public newUser: User; // Objeto para almacenar los datos del formulario del detalle new/update
  public userSelected: User; // Objeto para almacenar el elemento seleccionado en las acciones de la tabla / block list
  public selectRoles: OteosSelectItem[]; // Lista de permisos seleccionables para dropdown

  public filter: any;
  public roleOptions: OteosSelectItem[];
  public activeOptions: OteosSelectItem[];

  // Own Users Variables
  public editPassword: boolean;
  public pwdConfirm: string;

  public type_input_pwd: string;
  public type_input_pwd_confirm: string;

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
    this.cacheService.setElement("title", this.translateService.getTranslate('label.users.cache.title'))
    this.subManager = new Subscription();

    this.showMode = '';
    this.manageMode = '';
    this.totalItemsPage = 8;
    this.usersList = [];
    this.cols = [];
    this.tableItems = [];
    this.blockItems = [];
    this.newUser = new User();
    this.userSelected = new User();

    this.filter = {
      userName: '',
      email: '',
      role: '',
      active: '',
    }

    this.roleOptions = this.generateRoleFilterOptions();
    this.activeOptions = this.generateActiveFilterOptions();

    this.editPassword = false;
    this.pwdConfirm = '';
    
    this.type_input_pwd = "password";
    this.type_input_pwd_confirm = "password";
  }

  ngOnInit() {
    // Modo vista table por defecto
    this.showMode = "table";

    // Crear lista de columnas de la tabla
    this.cols = [
      {label: this.translateService.getTranslate('label.users.cols.name'), property: "userName"},
      {label: this.translateService.getTranslate('label.users.cols.email'), property: "email"},
      {label: this.translateService.getTranslate('label.users.cols.role'), property: "role.name"},
      {label: this.translateService.getTranslate('label.users.cols.active'), property: "active"}
    ];

    this.store.dispatch(new FetchRoles());
    this.store.dispatch(new FetchUsers({ filter: this.filter }));
    this.notifyChangeUsers();
    this.fetchUsers();
    this.fetchRoles();
  }

  /* Store Functions */
  notifyChangeUsers(){
    this.spinnerService.showSpinner();
    
    const sub = this.notifyChangeUsers$.subscribe({
      next: () => {
        this.store.dispatch(new FetchUsers({ filter: this.filter}))
      }
    });
    
    this.subManager.add(sub);
    this.spinnerService.hideSpinner();
  }

  fetchRoles(){
    this.spinnerService.showSpinner();

    const sub = this.roles$.subscribe({
      next: () =>{
        this.selectRoles = [];

        const roles = this.store.selectSnapshot(UsersState.roles);

        if(roles && roles.length > 0) {
          for (const role of roles) {
            this.selectRoles.push({label: role.name ,value: role});
          }
        }
      }
    });

    this.subManager.add(sub);
    this.spinnerService.hideSpinner();
  }

  fetchUsers(){
    this.spinnerService.showSpinner();

    const sub = this.users$.subscribe({
      next: () => {
        this.usersList = [];
        this.usersList = this.store.selectSnapshot(UsersState.users);
        
        this.blockItems = [];
        this.tableItems = [];
        this.createItems(this.usersList);   
      }, error: (err) => {
        this.spinnerService.hideSpinner();
      }
    });

    this.subManager.add(sub)
    this.spinnerService.hideSpinner();
  }

  createUser($event: User){  
    this.spinnerService.showSpinner();

    this.store.dispatch(new AddNewUser({ user: $event })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(UsersState.success);

        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.store.selectSnapshot(UsersState.successMsg)
          );
          this.closeForm();
          this.notifyChangeUsers();
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.store.selectSnapshot(UsersState.errorMsg)
          );
        }

        this.spinnerService.hideSpinner();
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.store.selectSnapshot(UsersState.errorMsg)
        );

        this.spinnerService.showSpinner();
      }
    });
  }

  editUser($event: User){
    this.spinnerService.showSpinner();

    this.store.dispatch(new EditUser({user: $event})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(UsersState.success);

        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.store.selectSnapshot(UsersState.successMsg)
          );
          this.closeForm();
          this.notifyChangeUsers();
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.store.selectSnapshot(UsersState.errorMsg)
          );
        }

        this.spinnerService.showSpinner();
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.store.selectSnapshot(UsersState.errorMsg)
        );

        this.spinnerService.showSpinner();
      }
    });
  }

  deleteUser($event: User){   
    this.spinnerService.showSpinner();

    this.store.dispatch(new DeleteUser({user: $event})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(UsersState.success);

        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.store.selectSnapshot(UsersState.successMsg)
          );
          this.notifyChangeUsers();
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.store.selectSnapshot(UsersState.errorMsg)
          );
        }
        
        this.spinnerService.showSpinner();
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.store.selectSnapshot(UsersState.errorMsg)
        );

        this.spinnerService.showSpinner();
      }
    });
  }

  /* Filter functions */
  search() {
    if (this.filter && this.filter.role) {
      const role: Role = new Role();
      role.name = this.filter.role;
      
      this.filter.role = role;
    }

    this.notifyChangeUsers();
    this.fetchUsers();
  }

  async clearFilter() {
    this.filter = {
      userName: '',
      email: '',
      role: '',
      active: '',
    }

    this.search();
  }

  generateRoleFilterOptions() {
    const roleOptions: any = [];

    roleOptions.push({label: this.translateService.getTranslate('label.general.all'), value: ''});
    for (const role in roleList) {
      if (roleList[role] == roleList['SUPERADMIN']) {
        continue;
      }

      const newRole: Role = new Role();
      newRole.name = roleList[role];

      roleOptions.push({label: roleList[role], value: newRole.name})
    }

    return roleOptions;
  }

  generateActiveFilterOptions() {
    const activeOptions: any = [];

    activeOptions.push({label: this.translateService.getTranslate('label.general.all'), value: ''});
    activeOptions.push({label: this.translateService.getTranslate('label.general.yes'), value: true});
    activeOptions.push({label: this.translateService.getTranslate('label.general.no'), value: false});

    return activeOptions;
  }

  /* Table and Block List Items Create */
  private createItems(users: User[]) {
    if (users == undefined || users == null) 
      return;
    if (users.length == 0)
      return;

      users.forEach((user, index) =>  {
      let actions: OteosAction<User>[] = [
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

      let blockItem = new OteosBlockItem<User>();
      blockItem.item = user;
      blockItem.actions = actions;
      blockItem.borderColor = blockItemBorderColor;
     

      this.blockItems.push(blockItem);

      let tableItem = new OteosTableItem<User>();
      tableItem.item = user;
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
  selectItem($event: OteosSelectedItem<User>) {

  }

  onCloseOptions($event) {

  }

  getAction($event) {
    this.userSelected = $event.item;

    if ($event.value == 'edit') {
      // Clonar el objeto seleccionado en el objeto nuevo/limpio del formulario
      this.newUser = cloneDeep(this.userSelected);
      this.newUser.password = '';
      this.newUser.newPassword = '';

      this.pwdConfirm = '';
      this.manageMode = 'update';
      this.showMode = 'form';
    }

    if ($event.value == 'delete') {
      this.modalService.open("delete-user");
    }
  } 

  /* Form Actions */
  openForm() {
    this.newUser = new User();
    this.newUser.active = true;
    this.newUser.role = this.selectRoles.find(sr => sr.value.name == 'USER').value;
    this.userSelected = new User();

    this.pwdConfirm = '';
    this.editPassword = false;
    this.manageMode = 'new';
    this.showMode = "form";
  }

  closeForm() {
    this.newUser = new User();
    this.userSelected = new User();

    this.editPassword = false;
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
      this.createUser(this.newUser);
    } else {
      // Controlo si esta marcada la opción Modificar contraseña o si solo es una edición de datos sin modificar la contraseña
      if (this.editPassword) {
        this.newUser.newPassword = this.newUser.password;
        this.newUser.password = undefined;
      } else {
        this.newUser.newPassword = undefined;
        this.newUser.password = undefined;
      }
      this.editUser(this.newUser);
    }
  }

  private validateDetailFormFields() {
    /* Empty Values Validation */
    if (!this.newUser.userName) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (!this.newUser.email) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (!this.newUser.role) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (this.newUser.active == undefined) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (this.manageMode == 'new' || (this.manageMode == 'update' && this.editPassword)) {
      if (!this.newUser.password) {
        return this.translateService.getTranslate('label.form.fields');
      }
      if (!this.pwdConfirm) {
        return this.translateService.getTranslate('label.form.fields');
      }
    }

    /* User Name Validations */
    if (this.newUser.userName.length < 4 || this.newUser.userName.length > 20) {
      return this.translateService.getTranslate('label.form.name.length.error');
    }

    /* Email Validations */
    let emailPattern: any = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    if (!emailPattern.test(this.newUser.email)) {
      return this.translateService.getTranslate('label.form.email.bad.format');
    }

    /* Password Validation */
    if (this.manageMode == 'new' || (this.manageMode == 'update' && this.editPassword)) {
      let pwdPattern: any = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);

      if (this.newUser.password.length < 8 || this.newUser.password.length > 20) {
        return this.translateService.getTranslate('label.form.pwd.length.error');
      }
      if (!pwdPattern.test(this.newUser.password)) {
        return this.translateService.getTranslate('label.form.pwd.pattern.error');
      }

      if (this.pwdConfirm.length < 8 || this.pwdConfirm.length > 20) {
        return this.translateService.getTranslate('label.form.pwd.length.error');
      } 
      if (!pwdPattern.test(this.pwdConfirm)) {
        return this.translateService.getTranslate('label.form.pwd.pattern.error');
      }

      if (this.newUser.password != this.pwdConfirm) {
        return this.translateService.getTranslate('label.form.pwds.not.equals');
      }
    }

    return '';
  }

  /* Modal Actions */
  onCloseModal($event) {
    this.userSelected = new User();
  }

  onConfirmModal($event) {
    let deletedUser: User = cloneDeep(this.userSelected);
    this.userSelected = new User();

    this.deleteUser(deletedUser);
  }

  /* */

  showHidePassowrd(confirmPwd: boolean = false) {
    if (!confirmPwd) {
      if (this.type_input_pwd == 'password') {
        this.type_input_pwd = 'text';
      } else {
        this.type_input_pwd = 'password';
      }
    } else {
      if (this.type_input_pwd_confirm == 'password') {
        this.type_input_pwd_confirm = 'text';
      } else {
        this.type_input_pwd_confirm = 'password';
      }
    }
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
