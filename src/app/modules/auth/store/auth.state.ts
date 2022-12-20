import { OteosCacheService } from 'oteos-components-lib';
import { Action, State, StateContext, Selector } from '@ngxs/store';
import { Token } from '../model/token';
import { AuthService } from '../auth.service';
import { tap, catchError, mergeMap, map } from 'rxjs/operators';
import { Login, Logout, FetchUserData, PasswordRecovery, EditUserPassword, FetchUserByPwdRecovery } from './auth.actions';
import { throwError, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { menuLogout } from '../../../utils/menu-items';
import { Util } from 'src/app/utils/util';
import { User } from '../../users/model/user';
import { Injectable } from '@angular/core';

export class AuthStateModel {
  token?: Token;
  loggedUser?: User;
  recoveryUser?: User;
  success?: boolean;
}

export const AuthStateDefaults: AuthStateModel = {
  token: null,
  loggedUser: null,
  recoveryUser: null,
  success: null
};

@State<AuthStateModel>({
  name: 'auth',
  defaults: AuthStateDefaults,
})

@Injectable()
export class AuthState {
  constructor(
    private authService: AuthService,
    private cacheService: OteosCacheService,
  ) {}

  @Selector()
  static token(state: AuthStateModel): Token {
    return state.token;
  }

  @Selector()
  static loggedUser(state: AuthStateModel): User {
    return state.loggedUser;
  }

  @Selector()
  static recoveryUser(state: AuthStateModel): User {
    return state.recoveryUser;
  }

  @Selector()
  static success(state: AuthStateModel): boolean {
    return state.success;
  }

  @Action(Login)
  public login(
    { patchState, dispatch }: StateContext<AuthStateModel>,
    { payload }: Login
  ) {
    return this.authService.login(payload).pipe(
      tap((newToken: Token) => {
        patchState({
          token: newToken,
        });     
      }),
      mergeMap(() => {
        return dispatch(new FetchUserData());
      }),
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      })
    );
  }

  @Action(Logout)
  public logout({ setState }: StateContext<AuthStateModel>): void {
    setState({ ...AuthStateDefaults });
    this.cacheService.setElement('menuItems', menuLogout);
  }

  @Action(FetchUserData)
  public fetchUserData({
    patchState,
  }: StateContext<AuthStateModel>): Observable<User> {
    return this.authService.fetchUserData().pipe(
      tap((userData: User) => {
        patchState({
          loggedUser: userData,
        });
        const menu = Util.selectMenu(userData);
        this.cacheService.setElement('menuItems', menu);    
      })
    );
  }

  @Action(PasswordRecovery)
  public passwordRecovery(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: PasswordRecovery
  ) {
    return this.authService.pwdRecovery(payload.email).pipe(
      tap((user: User) => {
        if(user){
          patchState({
            recoveryUser: user,
            success: true
          });
        }else{
          patchState({
            recoveryUser: null,
            success: false
          });
        }
      }),
      catchError(err => {
          patchState({
            success: false
          });
          throw new Error(err);
      }),
    );
  }

  @Action(EditUserPassword)
  public editUserPassword(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: EditUserPassword
  ) {
    return this.authService.editUserPassword(payload.user).pipe(
      tap((user: User) => {
        if(user){
            patchState({
              recoveryUser: user,
              success: true
            });
        }else{
            patchState({
              recoveryUser: null,
              success: false
            });
        }
      }),
      catchError(err => {
          patchState({
            success: false
          });
          throw new Error(err);
      }),
    );
  }

  @Action(FetchUserByPwdRecovery)
  public fetchUserByPwdRecovery(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: FetchUserByPwdRecovery
  ) {
    return this.authService.fetchUserByPwdRecovery(payload.pwdRecovery).pipe(
      map((user: User) => {
        patchState({ recoveryUser: user });
      })
    );
  }
}
