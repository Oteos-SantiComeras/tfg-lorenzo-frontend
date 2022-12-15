import { WS_PRODUCTS } from './../../constants/websockets.constants';
import { Product } from './model/product';
import { Pagination } from './../../models/pagination';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OteosJoinPipe } from 'oteos-components-lib';
import { Observable } from 'rxjs';
import { WsBackendService } from 'src/app/services/websockets.service';
import environment from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
    private readonly wsBackendService: WsBackendService
  ) {}

  fetchProducts(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.code) {
        params.push(`code=${filter.code}`);
      }
      if (filter.name) {
        params.push(`name=${filter.name}`);
      }
      if (filter.category) {
        params.push(`category=${filter.category}`);
      }
      if (filter.tax) {
        params.push(`tax=${filter.tax}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/products${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(environment.apiUrl + "/products", product);
  }

  editProduct(code: string, newProduct: Product): Observable<Product> {
    return this.http.put<Product>(environment.apiUrl + `/products/${code}`, newProduct);
  }

  deleteProduct(code: string): Observable<boolean> {
    return this.http.delete<boolean>(environment.apiUrl + `/products/${code}`);
  }

  setImageProduct(code: string, file: File): Observable<boolean> {
    const form = new FormData();
    form.append('file', file);
    
    return this.http.post<boolean>(environment.apiUrl + `/products/setImage/${code}`, form);
  }

  fetchCategories(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.name) {
        params.push(`name=${filter.name}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/categories${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  getProductsBySocket(): any {
    return this.wsBackendService.getMessage(WS_PRODUCTS);
  }

  removeSocket(): any {
    this.wsBackendService.removeListenerMessage(WS_PRODUCTS);
  }
}
