import { OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from './../../../models/pagination';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, map, tap } from 'rxjs/operators';
import { Permission } from '../../permissions/model/permission';
import { Role } from '../model/role';
import { RolesService } from '../roles.service';
import { AddRole, DeleteRole, FetchPermissions, FetchRoles, UpdateRole } from './roles.actions';

export class RoleStateModel {
    roles: Role[];
    permissions: Permission[];
    success: boolean;
    notifyChangeRoles:boolean;
    errorMsg: string;
    successMsg: string;
}
  
export const RoleStateDefaults: RoleStateModel = {
    roles: [],
    permissions: [],
    success: false,
    notifyChangeRoles:false,
    errorMsg: '',
    successMsg: '',
};

@State<RoleStateModel>({
    name: 'roles',
    defaults: RoleStateDefaults,
})

@Injectable()
export class RoleState {

  constructor(
    private readonly translateService: OteosTranslateService,
    private readonly roleService: RolesService
  ) {}

  @Selector()
  static roles(state: RoleStateModel): Role[] {
    return state.roles;
  }
  
  @Selector()
  static permissions(state: RoleStateModel): Permission[] {
    return state.permissions;
  }

  @Selector()
  static success(state: RoleStateModel): boolean {
    return state.success;
  }
  @Selector()
  static notifyChangeRoles(state: RoleStateModel): boolean {
    return state.notifyChangeRoles;
  }

  @Selector()
  static errorMsg(state: RoleStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: RoleStateModel): string {
    return state.successMsg;
  }

  @Action(FetchRoles)
  public fetchRoles(
    { patchState }: StateContext<RoleStateModel>,
    { payload }: FetchRoles
  ) {
    return this.roleService.fetchRoles(payload.filter).pipe(
      map((pagination: Pagination) => {
        const roles: any[] = pagination.items;
        patchState({
          roles: roles
        });
      })
    );
  }

  @Action(FetchPermissions)
  public fetchAllPermissions(ctx: StateContext<RoleStateModel>) {
    return this.roleService.fetchPermissions().pipe(
      map((pagination: Pagination) => {
        const permissions: any[] = pagination.items;
        ctx.patchState({ permissions });
      })
    );
  }

  @Action(AddRole)
  public addRole(
    { patchState }: StateContext<RoleStateModel>,
    { payload }: AddRole
  ) {
    return this.roleService.createRole(payload.role).pipe(
      tap((role: Role) => {
        if(role){
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.roles.create.success'),
          });
        }else{
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.roles.create.error'),
            successMsg: '',
          });
        }
      }),
      catchError(err => {
        let errorMsg: string = '';

        if (err.error.message == ("Role " + payload.role.name + " already exist")) {
          errorMsg = this.translateService.getTranslate('label.roles.create.already.exist');
        } else {
          errorMsg = this.translateService.getTranslate('label.roles.create.error');
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

  @Action(UpdateRole)
  public updateRole(
    { patchState }: StateContext<RoleStateModel>,
    { payload }: UpdateRole
  ) {
    return this.roleService.editRole(payload.oldName, payload.role).pipe(
        tap((role: Role) => {
          if(role){
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.roles.update.success'),
            });
          }else{
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.roles.update.error'),
              successMsg: '',
            });
          }
        }),
        catchError(err => {
          let errorMsg: string = '';

          if (err.error.message == ("Role " + payload.oldName + " not found")) {
            errorMsg = this.translateService.getTranslate('label.roles.update.role.not.found');
          } else if (err.error.message == ("Role " + payload.role.name + " already exist")) {
            errorMsg = this.translateService.getTranslate('label.roles.update.already.exist');
          } else {
            errorMsg = this.translateService.getTranslate('label.roles.update.error');
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

  @Action(DeleteRole)
  public deleteRole( 
    { patchState }: StateContext<RoleStateModel>,
    { payload }: DeleteRole
  ) {
    return this.roleService.deleteRole(payload.name).pipe(
      tap((role: Role) => {
          if(role){
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.roles.delete.success'),
            });
          }else{
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.roles.delete.error'),
              successMsg: '',
            });
          }
      }),
      catchError(err => {
        let errorMsg: string = '';

        if (err.error.message == ("Role " + payload.name + " not found")) {
          errorMsg = this.translateService.getTranslate('label.roles.delete.role.not.found');
        } else if (err.error.message == ("Role " + payload.name + " contains users")) {
          errorMsg = this.translateService.getTranslate('label.roles.delete.role.contain.users');
        } else {
          errorMsg = this.translateService.getTranslate('label.roles.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMsg,
          successMsg: '',
        });

        throw new Error(err);
      })
    );
  }
}