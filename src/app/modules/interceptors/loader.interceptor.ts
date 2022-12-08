import {
  HttpEvent,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { OteosSpinnerService } from 'oteos-components-lib';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoaderInterceptor implements HttpInterceptor {
  constructor(
    private store: Store,
    private spinnerService: OteosSpinnerService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.spinnerService.showSpinner();
    //this.store.dispatch(new ShowLoader());
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.spinnerService.hideSpinner();
            //this.store.dispatch(new HideLoader());
          }
        },
        (_err: any) => {
          // tslint:disable-next-line:no-identical-functions
          //this.store.dispatch(new HideLoader());
          this.spinnerService.hideSpinner();
        }
      )
    );
  }
}
