import  environment  from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../users/model/user';
import { ConfirmPasswordResetDto } from './model/confirm-password-reset';
import { LoginDto } from './model/login.dto';
import { PasswordResetDto } from './model/password-reset-dto';
import { Token } from './model/token';
import { Message } from '../emailer/model/message';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  route = 'auth';

  constructor(private http: HttpClient) {}

  login(loginData: LoginDto): Observable<Token> {
    return this.http.post<Token>(environment.apiUrl + '/auth/login', loginData);
  }

  requestPw(passwordResetDto: PasswordResetDto): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/auth/reset-password', passwordResetDto);
  }

  confirmPwReset(confirmPw: ConfirmPasswordResetDto): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/auth/confirm-password-reset', confirmPw);
  }

  refreshToken(refreshToken: string): Observable<Token> {
    return this.http.post<Token>(environment.apiUrl + '/auth/new-token', { refreshToken });
  }

  fetchUserData(): Observable<User> {
    return this.http.get<User>(environment.apiUrl + '/auth/user-data');
  }

  /* Password Recovery */
  pwdRecovery(email: string):Observable<User> {
    return this.http.put<User>(environment.apiUrl + `/users/pwdRecovery/${email}`, null)
  }

  sendPasswordRecoveryEmail(message: Message):Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + '/emailer', message)
  }

  editUserPassword(user: User):Observable<User> {
    return this.http.put<User>(environment.apiUrl + `/users/updatePassword/${user.userName}`, user)
  }

  fetchUserByPwdRecovery(pwdRecovery: string):Observable<User> {
    return this.http.get<User>(environment.apiUrl + `/users/byPwdRecovery/${pwdRecovery}`)
  }

  /* No EndPoint Functions */
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
