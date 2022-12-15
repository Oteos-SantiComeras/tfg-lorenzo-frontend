import { Order } from './model/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OteosJoinPipe } from 'oteos-components-lib';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination';
import { WsBackendService } from 'src/app/services/websockets.service';
import environment from 'src/environments/environment';
import { WS_ORDERS } from 'src/app/constants/websockets.constants';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
    private readonly wsBackendService: WsBackendService
  ) {}

  fetchOrders(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter._id) {
        params.push(`_id=${filter._id}`);
      }
      if (filter.name) {
        params.push(`name=${filter.name}`);
      }
      if (filter.secondName) {
        params.push(`secondName=${filter.secondName}`);
      }
      if (filter.email) {
        params.push(`email=${filter.email}`);
      }
      if (filter.country) {
        params.push(`country=${filter.country}`);
      }
      if (filter.address) {
        params.push(`address=${filter.address}`);
      }
      if (filter.zipCode) {
        params.push(`zipCode=${filter.zipCode}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/orders${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(environment.apiUrl + "/orders", order);
  }

  editOrder(_id: string, newOrder: Order): Observable<Order> {
    return this.http.put<Order>(environment.apiUrl + `/orders/${_id}`, newOrder);
  }

  deleteOrder(_id: string): Observable<boolean> {
    return this.http.delete<boolean>(environment.apiUrl + `/orders/${_id}`);
  }

  getOrdersBySocket(): any {
    return this.wsBackendService.getMessage(WS_ORDERS);
  }

  removeSocket(): any {
    this.wsBackendService.removeListenerMessage(WS_ORDERS);
  }

}
