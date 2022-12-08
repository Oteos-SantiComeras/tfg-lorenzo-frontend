import { OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from './../../../models/pagination';
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap } from "rxjs/operators";
import { Permission } from "../model/permission";
import { PermissionsService } from "../permissions.service";
import { CreatePermission, DeletePermission, EditPermission, FetchPermissions, SubscribePermissionsWS, UnSubscribePermissionsWS } from "./permissions.actions";

export class PermissionsStateModel {
  permissions: Permission[];
  success: boolean;
  notifyChangePermissions: boolean;
  errorMsg: string;
  successMsg: string;
}

export const PermissionsStateDefault: PermissionsStateModel = {
  permissions: [],
  success: false,
  notifyChangePermissions: false,
  errorMsg: '',
  successMsg: '',
};

@State<PermissionsStateModel>({
  name: "permissions",
  defaults: PermissionsStateDefault,
})

@Injectable()
export class PermissionsState {

  constructor(
    private readonly toastService: OteosToastService,
    private readonly translateService: OteosTranslateService,
    private readonly permissionsService: PermissionsService
  ) {
    
  }

  @Selector()
  static permissions(state: PermissionsStateModel): Permission[] {
    return state.permissions;
  }

  @Selector()
  static success(state: PermissionsStateModel): boolean {
    return state.success;
  }
  @Selector()
  static notifyChangePermissions(state: PermissionsStateModel): boolean {
    return state.notifyChangePermissions;
  }

  @Selector()
  static errorMsg(state: PermissionsStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: PermissionsStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchPermissions)
  public fetchPermissions (
    { patchState }: StateContext<PermissionsStateModel>,
    { payload }: FetchPermissions
  ) {
    return this.permissionsService.fetchPermissions(payload.filter).pipe(
      map((pagination: Pagination) => {
        const permissions: any[] = pagination.items;
        patchState({
          permissions: permissions
        });
      })
    );
  }

  @Action(CreatePermission)
  public createPermission(
    { patchState }: StateContext<PermissionsStateModel>,
    { payload }: CreatePermission
  ) {
    return this.permissionsService.createPermission(payload.permission).pipe(
      tap((permission: Permission) => {
        if (permission) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.permissions.create.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.permissions.create.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Permission " + payload.permission + " already exist")) {
          errorMSg = this.translateService.getTranslate('label.permissions.create.already.exist');
        } else {
          errorMSg = this.translateService.getTranslate('label.permissions.create.error');
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

  @Action(EditPermission)
  public editPermission(
    { patchState }: StateContext<PermissionsStateModel>,
    { payload }: EditPermission
  ) {
    return this.permissionsService
      .editPermission(payload.oldPermission, payload.newPermision)
      .pipe(
        tap((permission: Permission) => {
          if (permission) {
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.permissions.update.success'),
            });
          } else {
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.permissions.update.error'),
              successMsg: '',
            });
          }
        }),
        catchError((err) => {
          let errorMSg: string = '';
          console.log(err.error.message)
          console.log(payload.newPermision)
          if (err.error.message == ("Permission " + payload.oldPermission + " not found")) {
            errorMSg = this.translateService.getTranslate('label.permissions.update.not.found');
          } else if (err.error.message == ("Permission " + payload.newPermision.name + " already exist")) {
            errorMSg = this.translateService.getTranslate('label.permissions.update.already.exist');
          } else {
            errorMSg = this.translateService.getTranslate('label.permissions.update.error');
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

  @Action(DeletePermission)
  deletePermission(
    { patchState }: StateContext<PermissionsStateModel>,
    { payload }: DeletePermission
  ) {
    return this.permissionsService.deletePermission(payload.permission)
      .pipe(tap((permission: Permission) => {
        if (permission) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.permissions.delete.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.permissions.delete.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Permission " + payload.permission + " not found")) {
          errorMSg = this.translateService.getTranslate('label.permissions.delete.not.found');
        } else {
          errorMSg = this.translateService.getTranslate('label.permissions.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });
      
        throw new Error(err);
      }));
  }

  @Action(SubscribePermissionsWS)
  public suscribePermissionsWS(ctx: StateContext<PermissionsStateModel>) {
    return this.permissionsService.getPermissionsBySocket().pipe(
      map((change: boolean) => {
        if(change){
        let state = ctx.getState();
        state = {
          ...state,
          notifyChangePermissions: !state.notifyChangePermissions,
        };
        ctx.setState({
          ...state,
        });
      }
      })
    )
  }

  @Action(UnSubscribePermissionsWS)
  public unsuscribePermissionsWS(ctx: StateContext<PermissionsStateModel>) {
    this.permissionsService.removeSocket();
  }
}

