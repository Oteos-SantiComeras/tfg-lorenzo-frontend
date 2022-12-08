import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith('api/')) {
      if (request.url.match('api/users/admin')) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Basic' + btoa('admin:admin'),
          },
        });
      }

      request = request.clone({
        url: request.url.replace('api', environment.apiUrl),
      });
    } 
    /* else if (request.url.startsWith('api-traffic/')) {
      request = request.clone({
        url: request.url.replace(
          'api-traffic',
          `http://${environment.hostname}:3000/api`
        ),
      });
      if (
        request.url.includes('crosses') ||
        request.url.includes('crosses-logic')
      ) {
        request = request.clone({
          url: request.url.replace('api/', ``),
        });
      }
    }  */

    return next.handle(request);
  }
}
