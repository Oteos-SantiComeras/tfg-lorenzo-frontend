import { Token } from './model/token';
import  environment  from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../users/model/user';
import { LoginDto } from './model/login.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  route = 'auth';

  constructor(private http: HttpClient) {}

  login(loginData: LoginDto): Observable<Token> {
    return this.http.post<Token>(environment.apiUrl + '/auth/login', loginData);
  }

  fetchUserData(): Observable<User> {
    return this.http.get<User>(environment.apiUrl + '/auth/user-data');
  }

  pwdRecovery(email: string):Observable<User> {
    return this.http.put<User>(environment.apiUrl + `/users/pwdRecovery/${email}`, null)
  }

  editUserPassword(user: User):Observable<User> {
    return this.http.put<User>(environment.apiUrl + `/users/updatePassword/${user.userName}`, user)
  }

  fetchUserByPwdRecovery(pwdRecovery: string):Observable<User> {
    return this.http.get<User>(environment.apiUrl + `/users/byPwdRecovery/${pwdRecovery}`)
  }

  hasPermission(user: User, permissions: string[]): boolean {
    
    if(user.role.name == "SUPERADMIN"){
      return true;
    }
    
    const hasPermission =
      user &&
      user.role &&
      permissions
        .map(whitePermission => {
          return user.role.permissions.some(permission => {
            return permission.name === whitePermission.toUpperCase();
          });
        })
        .some(res => res);

    return hasPermission || permissions.includes("PUBLIC");
  }
}
