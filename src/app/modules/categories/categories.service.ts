import { Category } from './model/category';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OteosJoinPipe } from 'oteos-components-lib';
import { Observable } from 'rxjs';
import { Pagination } from 'src/app/models/pagination';
import { WsBackendService } from 'src/app/services/websockets.service';
import environment from 'src/environments/environment';
import { WS_CATEGORIES } from 'src/app/constants/websockets.constants';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
    private readonly wsBackendService: WsBackendService
  ) {}

  fetchCategories(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.name) {
        params.push(`name=${filter.name}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/categories${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  createCategory(category: Category): Observable<Category> {
    let categoryDto: any = {
      name: category.name
    }
    return this.http.post<Category>(environment.apiUrl + "/categories", categoryDto);
  }

  editCategory(name: string, category: Category): Observable<Category> {
    return this.http.put<Category>(environment.apiUrl + `/categories/${name}`, category);
  }

  deleteCategory(name: string): Observable<boolean> {
    return this.http.delete<boolean>(environment.apiUrl + `/categories/${name}`);
  }

  getCategoriesBySocket(): any {
    return this.wsBackendService.getMessage(WS_CATEGORIES);
  }

  removeSocket(): any {
    this.wsBackendService.removeListenerMessage(WS_CATEGORIES);
  }
}
