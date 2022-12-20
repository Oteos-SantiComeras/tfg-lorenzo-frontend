import { Pagination } from './../../models/pagination';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';
import { User } from './model/user';
import { OteosJoinPipe } from 'oteos-components-lib';

@Injectable({
  providedIn: 'root',
})
export class UsersService {

  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
  ) {}

  /* Basic Users CRUD  */
  createUser(user: User):Observable<User> {
    return this.http.post<User>(environment.apiUrl + '/users/', user)
  }

  fetchUsers(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.userName) {
        params.push(`userName=${filter.userName}`);
      }
      if (filter.email) {
        params.push(`email=${filter.email}`);
      }
      if (filter.role) {
        params.push(`role=${filter.role.name}`);
      }
      if (filter.active == 'true' || filter.active == 'false') {
        params.push(`active=${filter.active}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/users${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  editUser(user: User):Observable<User> {
    return this.http.put<User>(environment.apiUrl + `/users/${user.userName}`, user)
  }

  deleteUser(user: User){
    return this.http.delete<User>(environment.apiUrl + `/users/${user.userName}`)
  }

  createUserNoAuth(user: User):Observable<User> {
    return this.http.post<User>(environment.apiUrl + '/users/noAuth', user)
  }

  fetchRoles(): Observable<Pagination> {
    return this.http.get<Pagination>(environment.apiUrl + '/roles');
  }
}
