import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AuthState } from '../auth/store/auth.state';
import { Token } from '../auth/model/token';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  @Select(AuthState.token) token$: Observable<Token>;

  token: Token;

  constructor() {
    this.token$.subscribe((token: Token) => {
      this.token = token;
    });
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    try {
      if (this.token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${this.token.accessToken}`,
          },
        });
      }
    } catch (err) {}
    return next.handle(request);
  }
}
