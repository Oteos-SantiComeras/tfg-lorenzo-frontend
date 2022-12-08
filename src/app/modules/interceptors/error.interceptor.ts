import { OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthState } from '../auth/store/auth.state';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Token } from '../auth/model/token';
import { Logout, RestoreToken } from '../auth/store/auth.actions';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    public authService: AuthService,
    public store: Store,
    private toastService: OteosToastService,
    private readonly router: Router,
    private translateService: OteosTranslateService
  ) {}

  @Select(AuthState.token) token$: Observable<Token>;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return (<any>next.handle(request)).timestamp === undefined
      ? next.handle(request).pipe(
          catchError((err: HttpErrorResponse | Error) => {        
            if (err instanceof HttpErrorResponse) {
              // Errores de tipo HttpErrorResponse
              switch (err.status) {
                case 401: {
                  return this.error401(request, err, next);
                }
                /* case 500:
                case 501:
                case 502:
                case 503:
                case 504: {
                  this.error5xx();
                  break;
                }
                case 0: {
                  this.error0(request.url);
                  break;
                } */
              }

              throw new HttpErrorResponse(err);
            } else if (err instanceof Error) {
              // Errores de tipo Error
              switch (err.name) {
                case 'TimeoutError': {
                  this.timeout();
                }
              }
            }

            throw err;
          })
        )
      : next.handle(request);
  }

  // Funciones de control de errores
  error401(request: HttpRequest<any>, errorResponse: HttpErrorResponse, next: HttpHandler) {
    const token = this.store.selectSnapshot(AuthState.token);

    if (token && token.refreshToken) {
      const refreshToken = token.refreshToken;

      return this.authService.refreshToken(refreshToken).pipe(
        switchMap((newToken: Token) => {
          this.store.dispatch(new RestoreToken(newToken));
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken.accessToken}`,
            },
          });
          return next.handle(request);
        }),
        catchError((err) => {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.translateService.getTranslate('label.interceptor.expired.session')
          );

          this.store.dispatch(new Logout()).subscribe({
            next: () => {
              this.router.navigate(['/auth', 'login']);
            },
          });

          throw err;
        })
      );
    } else {
      /* this.toastService.addErrorMessage(
        'ERROR',
        this.translateService.getTranslate('label.login.required')
      ); */

      this.store.dispatch(new Logout()).subscribe({
        next: () => {
          this.router.navigate(['/auth', 'login']);
        },
      });

      return throwError(errorResponse);
    }
  }

  error0(url: string) {
    this.toastService.addErrorMessage(
      this.translateService.getTranslate('label.error.title'),
      this.translateService.getTranslate('label.interceptor.server.connection')
    );
  }

  error5xx() {
    /* this.toastService.addErrorMessage(
      this.translateService.getTranslate('label.error.title'),
      "Label Server 500"
    ); */
  }

  timeout() {
    this.toastService.addErrorMessage(
      this.translateService.getTranslate('label.error.title'),
      this.translateService.getTranslate('label.interceptor.expired.time')
    );
  }
}
