import { LoginDto } from '../model/login.dto';
import { User } from '../../users/model/user';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: LoginDto) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class FetchUserData {
  static readonly type = '[Auth] FetchUserData';
}

export class PasswordRecovery {
  static readonly type = '[USER] Password recovery for a user';
  constructor(public payload: {email: string}) {}
}

export class EditUserPassword {
  static readonly type = '[USER] Edit a user password';
  constructor(public payload: {user: User}) {}
}

export class FetchUserByPwdRecovery {
  static readonly type = '[USER] Fetch user by password recovery token';
  constructor(public payload: {pwdRecovery: string}) {}
}