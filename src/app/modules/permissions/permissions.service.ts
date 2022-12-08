import { OteosJoinPipe } from 'oteos-components-lib';
import { Pagination } from './../../models/pagination';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { WS_PERMISSIONS } from "src/app/constants/websockets.constants";
import { WsBackendService } from "src/app/services/websockets.service";
import environment from "src/environments/environment";
import { Permission } from "./model/permission";

@Injectable({
  providedIn: "root",
})
export class PermissionsService {
  constructor(
    private readonly joinPipe: OteosJoinPipe,
    private readonly http: HttpClient,
    private readonly wsBackendService: WsBackendService
  ) {}

  fetchPermissions(filter: any): Observable<Pagination> {
    let params: string[] = [];

    if (filter) {
      if (filter.name) {
        params.push(`name=${filter.name}`);
      }
    }

    return this.http.get<Pagination>(environment.apiUrl + `/permissions${params.length == 0 ? '' : '?' + this.joinPipe.transform(params, '&')}`);
  }

  createPermission(permissionName: string): Observable<Permission> {
    let permissionDto: any = {
      name: permissionName
    }
    return this.http.post<Permission>(environment.apiUrl + "/permissions", permissionDto);
  }

  editPermission(oldPermission: string, newPermission: Permission): Observable<Permission> {
    return this.http.put<Permission>(environment.apiUrl + `/permissions/${oldPermission}`, newPermission);
  }

  deletePermission(permission: string): Observable<Permission> {
    return this.http.delete<Permission>(environment.apiUrl + `/permissions/${permission}`);
  }

  getPermissionsBySocket(): any {
    return this.wsBackendService.getMessage(WS_PERMISSIONS);
  }

  removeSocket(): any {
    this.wsBackendService.removeListenerMessage(WS_PERMISSIONS);
  }
  
}
