import { LoginDto } from '../model/login.dto';
import { PasswordResetDto } from '../model/password-reset-dto';
import { Token } from '../model/token';
import { ConfirmPasswordResetDto } from '../model/confirm-password-reset';
import { User } from '../../users/model/user';
import { Message } from '../../emailer/model/message';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: LoginDto) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class RequestPw {
  static readonly type = '[Auth] Request Pw';
  constructor(public passwordResetDto: PasswordResetDto) {}
}
export class ConfirmPwReset {
  static readonly type = '[Auth] Confirm Pw reset';
  constructor(public payload: { confirmPwReset: ConfirmPasswordResetDto }) {}
}
export class RestoreToken {
  static readonly type = '[Auth] RestoreToken';
  constructor(public payload: Token) {}
}

export class FetchUserData {
  static readonly type = '[Auth] FetchUserData';
}

/* Password Recovery */
export class PasswordRecovery {
  static readonly type = '[USER] Password recovery for a user';
  constructor(public payload: {email: string}) {}
}

export class SendPasswordRecoveryEmail {
  static readonly type = '[USER] Send password recovery email'
  constructor(public payload: {message: Message}) {}
}

export class EditUserPassword {
  static readonly type = '[USER] Edit a user password';
  constructor(public payload: {user: User}) {}
}

export class FetchUserByPwdRecovery {
  static readonly type = '[USER] Fetch user by password recovery token';
  constructor(public payload: {pwdRecovery: string}) {}
}