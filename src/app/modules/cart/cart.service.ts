import { Cart } from './model/cart';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OteosJoinPipe } from 'oteos-components-lib';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination';
import environment from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
  ) {}

  fetchCarts(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.user) {
        params.push(`user=${filter.user}`);
      }
      if (filter._id) {
        params.push(`_id=${filter._id}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/cart${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  createCart(cart: Cart): Observable<Cart> {
    return this.http.post<Cart>(environment.apiUrl + "/cart", cart);
  }

  editCart(_id: string, newCart: Cart): Observable<Cart> {
    return this.http.put<Cart>(environment.apiUrl + `/cart/${_id}`, newCart);
  }

  deleteCart(_id: string): Observable<boolean> {
    return this.http.delete<boolean>(environment.apiUrl + `/cart/${_id}`);
  }
}
