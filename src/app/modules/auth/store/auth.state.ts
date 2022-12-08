import { OteosToastService, OteosCacheService, OteosTranslateService } from 'oteos-components-lib';
import { Action, State, StateContext, Selector } from '@ngxs/store';
import { Token } from '../model/token';
import { AuthService } from '../auth.service';
import { tap, catchError, mergeMap, map } from 'rxjs/operators';
import { Login, Logout, RequestPw, RestoreToken, ConfirmPwReset, FetchUserData, PasswordRecovery, EditUserPassword, FetchUserByPwdRecovery, SendPasswordRecoveryEmail } from './auth.actions';
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
    private toastService: OteosToastService,
    private cacheService: OteosCacheService,
    private translateService: OteosTranslateService
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
    { patchState, dispatch, getState }: StateContext<AuthStateModel>,
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
        if (err.status === 401) {
         /*  this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.translateService.getTranslate("label.auth.form.bad.request")
          ); */
        }
        return throwError(err);
      })
    );
  }

  @Action(Logout)
  public logout({ setState }: StateContext<AuthStateModel>): void {
    setState({ ...AuthStateDefaults });
    this.cacheService.setElement('menuItems', menuLogout);
  }

  @Action(RequestPw)
  public requestPw(
    {}: StateContext<AuthStateModel>,
    { passwordResetDto }: RequestPw
  ): Observable<void> {
    return this.authService.requestPw(passwordResetDto).pipe(
      tap(() => {
        this.toastService.addSuccessMessage(
          'SUCCESS',
          'Petición de reinicio de contraseña confirmada. Por favor, revise su correo.'
        );
      }),
      catchError((err) => {
        this.toastService.addErrorMessage(
          'ERROR',
          'Error en la petición de reinicio de contraseña.'
        );
        return throwError(err);
      })
    );
  }

  @Action(ConfirmPwReset)
  public confirmPwReset(
    {}: StateContext<AuthStateModel>,
    { payload }: ConfirmPwReset
  ) {
    return this.authService.confirmPwReset(payload.confirmPwReset).pipe(
      tap(() => {
        this.toastService.addSuccessMessage(
          'SUCCESS',
          'Contraseña restablecida con éxito.'
        );
      }),
      catchError((err) => {
        this.toastService.addErrorMessage(
          'ERROR',
          'Su token ha caducado o no existe.'
        );
        return throwError(err);
      })
    );
  }

  @Action(RestoreToken)
  public restoreToken(
    { patchState, dispatch }: StateContext<AuthStateModel>,
    { payload }: RestoreToken
  ) {
    patchState({
      token: payload,
    });
    return dispatch(new FetchUserData());
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

  /* Password Recovery */
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

  @Action(SendPasswordRecoveryEmail)
  public sendPasswordRecoveryEmail(
    { patchState }: StateContext<AuthStateModel>,
    { payload }: SendPasswordRecoveryEmail
  ) {
    return this.authService.sendPasswordRecoveryEmail(payload.message).pipe(
      tap((result: boolean) => {
        patchState({
          success: result
        });
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
