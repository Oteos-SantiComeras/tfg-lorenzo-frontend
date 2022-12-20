import { OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from './../../../models/pagination';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../../../modules/users/model/user';
import { Role } from '../../roles/model/role';
import { UsersService } from '../users.service';
import { AddNewUser, DeleteUser, EditUser, FetchRoles, FetchUsers, AddNewUserNoAuth } from './users.actions';


export class UsersStateModel {
  usersList: User[];
  roles: Role[];
  success: boolean;
  notifyChangeUsers: boolean;
  errorMsg: string;
  successMsg: string;
}

export const UsersStateDefaults: UsersStateModel = {
  usersList: [],
  roles:[],
  success: false,
  notifyChangeUsers: false,
  errorMsg: '',
  successMsg: '',
};

@State<UsersStateModel>({
  name: 'users',
  defaults: UsersStateDefaults,
})

@Injectable()
export class UsersState {

  constructor(
    private readonly translateService: OteosTranslateService,
    private readonly usersService: UsersService
  ) {}

  @Selector()
  static users(state: UsersStateModel): User[] {
    return state.usersList;
  }
  
  @Selector()
  static success(state: UsersStateModel): boolean {
    return state.success;
  }

  @Selector()
  static roles(state: UsersStateModel): Role[] {
    return state.roles;
  }
  @Selector()
  static notifyChangeUsers(state: UsersStateModel): boolean {
    return state.notifyChangeUsers;
  }

  @Selector()
  static errorMsg(state: UsersStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: UsersStateModel): string {
    return state.successMsg;
  }

  /* Basic Users CRUD  */
  @Action(FetchUsers)
  public fetchAllUsers(
    { patchState }: StateContext<UsersStateModel>,
    { payload }: FetchUsers
  ) { 
    return this.usersService.fetchUsers(payload.filter).pipe(
      map((pagination: Pagination) => {
        const usersList: any [] = pagination.items;
        patchState({
          usersList: usersList,
        });
      })
    );
  }

  @Action(AddNewUser)
  public addNewUser(
    { patchState }: StateContext<UsersStateModel>,
    { payload }: AddNewUser
  ) {
    return this.usersService.createUser(payload.user).pipe(
      tap((user: User) => {
        if(user){
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.users.create.success'),
            });
        }else{
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.users.create.error'),
              successMsg: '',
            });
        }
      }),
      catchError(err => {
        let errorMsg: string = '';

        if (err.error.message == ('User ' + payload.user.userName + ' already exist')) {
          errorMsg = this.translateService.getTranslate('label.users.create.already.exist');
        } else if (err.error.message == ('Email ' + payload.user.email + ' already registered')) {
          errorMsg = this.translateService.getTranslate('label.users.create.email.already.exist');
        } else if (err.error.message == ('Role ' + payload.user.userName + ' not exist')) {
          errorMsg = this.translateService.getTranslate('label.users.create.role.not.exist');
        } else {
          errorMsg = this.translateService.getTranslate('label.users.create.error');
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
          successMsg: '',
        });
        
        throw new Error(err);
      }),
    );
  }

  @Action(EditUser)
  public editUser(
    { patchState }: StateContext<UsersStateModel>,
    { payload }: EditUser
  ) {
    return this.usersService.editUser(payload.user).pipe(
      tap((user: User) => {
        if(user){
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.users.update.success'),
            });
        }else{
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.users.update.error'),
              successMsg: '',
            });
        }
      }),
      catchError(err => {
          let errorMsg: string = '';

          if (err.error.message == ("User " + payload.user.userName + ' not found')) {
            errorMsg = this.translateService.getTranslate('label.users.update.user.not.found');
          } else if (err.error.message == ("User " + payload.user.userName + ' incorrect password')) {
            errorMsg = this.translateService.getTranslate('label.users.update.user.incorrect.pwd');
          } else if (err.error.message == ('Email ' + payload.user.email + ' already registered')) {
            errorMsg = this.translateService.getTranslate('Label.users.update.email.already.exist');
          } else if (err.error.message == ('Role ' + payload.user.role.name + ' not exist')) {
            errorMsg = this.translateService.getTranslate('label.users.update.role.not.exist');
          } else {
            errorMsg = this.translateService.getTranslate('label.users.update.error');
          }

          patchState({
            success: false,
            errorMsg: errorMsg,
            successMsg: '',
          });

          throw new Error(err);
      }),
    );
  }

  @Action(DeleteUser)
  public deleteUser( 
    { patchState }: StateContext<UsersStateModel>,
    { payload }: DeleteUser
  ) {
    return this.usersService.deleteUser(payload.user).pipe(
      tap((user: User) => {
        if(user){
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.users.delete.success'),
          });
        }else{
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.users.delete.error'),
            successMsg: '',
          });
        }
      }),
      catchError(err => {
        let errorMsg: string = '';

        if (err.error.message == ("User " + payload.user.userName + ' not found')) {
          errorMsg =  this.translateService.getTranslate('label.users.delete.user.not.found');
        } else {
          errorMsg = this.translateService.getTranslate('label.users.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
          successMsg: '',
        });

        throw new Error(err);
      }),
    );
  }
  
  /* Register EndPoint Not AuthGuard Required (Register) */
  @Action(AddNewUserNoAuth)
  public addNewUserNoAuth(
    { patchState }: StateContext<UsersStateModel>,
    { payload }: AddNewUserNoAuth
  ) {
    return this.usersService.createUserNoAuth(payload.user).pipe(
      tap((user: User) => {
        if(user){
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.register.create.success'),
            });
        }else{
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.register.create.error'),
              successMsg: '',
            });
        }
      }),
      catchError(err => {
        let errorMsg: string = '';

        if (err.error.message == ('User ' + payload.user.userName + ' already exist')) {
          errorMsg = this.translateService.getTranslate('label.users.create.already.exist');
        } else if (err.error.message == ('Email ' + payload.user.email + ' already registered')) {
          errorMsg = this.translateService.getTranslate('label.users.create.email.already.exist');
        } else if (err.error.message == ('Role ' + payload.user.userName + ' not exist')) {
          errorMsg = this.translateService.getTranslate('label.users.create.role.not.exist');
        } else {
          errorMsg = this.translateService.getTranslate('label.register.create.error');
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
          successMsg: '',
        });
        
        throw new Error(err);
      }),
    );
  }

  /* Role Endpoint To Fetch Roles For Users Manage Create / Edit user (Dropdown objects) */
  @Action(FetchRoles)
  public fetchRoles(ctx: StateContext<UsersStateModel>) {
    return this.usersService.fetchRoles().pipe(
      map((pagination: Pagination) => {
        const roles: any [] = pagination.items;
        ctx.patchState({ roles });
      })
    );
  }
}