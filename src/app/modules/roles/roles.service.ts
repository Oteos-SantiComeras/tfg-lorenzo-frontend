import { Pagination } from './../../models/pagination';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WS_ROLES } from 'src/app/constants/websockets.constants';
import { WsBackendService } from 'src/app/services/websockets.service';
import environment from 'src/environments/environment';
import { Permission } from '../permissions/model/permission';
import { Role } from './model/role';
import { OteosJoinPipe } from 'oteos-components-lib';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
    private readonly wsBackendService: WsBackendService
  ) {}

  fetchRoles(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.name) {
        params.push(`name=${filter.name}`);
      }
    }
    return this.http.get<Pagination>(environment.apiUrl + `/roles${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  fetchPermissions():Observable<Pagination>{
    return this.http.get<Pagination>(environment.apiUrl + '/permissions')
  }

  createRole(role: Role):Observable<Role> {
    return this.http.post<Role>(environment.apiUrl + '/roles/', role)
  }

  editRole(oldName: string, role: Role):Observable<Role> {
    console.log("editRole")
    console.log(role);
    return this.http.put<Role>(environment.apiUrl + `/roles/${oldName}`, role)
  }

  deleteRole(name: string){
    return this.http.delete<Role>(environment.apiUrl + `/roles/${name}`)
  }

  getRoleBySocket(): any {
    return this.wsBackendService.getMessage(WS_ROLES);
  }

  removeSocket(): any {
    this.wsBackendService.removeListenerMessage(WS_ROLES);
  }
}