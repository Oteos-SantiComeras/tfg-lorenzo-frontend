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

/* Role Endpoint To Fetch Roles For Users Manage Create / Edit user (Dropdown objects) */
export class FetchRoles {
    static readonly type = '[USER] Fetch all roles';
}