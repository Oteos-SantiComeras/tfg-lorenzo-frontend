import { Message } from './../../emailer/model/message';
import { User } from "../../users/model/user";

/* Basic Users CRUD  */
export class AddNewUser {
    static readonly type = '[USER] Create new user';
    constructor(public payload: {user: User} ) {}
}

export class FetchUsers{
    static readonly type = '[USER] Fetch all users';
    constructor(public payload: { filter: any }) {}
}

export class EditUser {
    static readonly type = '[USER] Edit a user';
    constructor(public payload: {user: User}) {}
}

export class DeleteUser {
    static readonly type = '[USER] Delete a user';
    constructor(public payload: { user: User}) {}
}

/* Register EndPoint Not AuthGuard Required (Register) */
export class AddNewUserNoAuth {
    static readonly type = '[USER] Create new user no auth';
    constructor(public payload: {user: User} ) {}
}

/* Send Register Mail */
export class SendRegisterEmail {
    static readonly type = '[USER] Send register email';
    constructor(public payload: {message: Message}) {}
}

/* Role Endpoint To Fetch Roles For Users Manage Create / Edit user (Dropdown objects) */
export class FetchRoles {
    static readonly type = '[USER] Fetch all roles';
}

/* Web Sockets */
export class SubscribeUserWS{
    static readonly type = '[USER] Subscribe user WS'
}

export class UnSubscribeUserWS {
    static readonly type = '[USER] UnSubscribe user WS';
}