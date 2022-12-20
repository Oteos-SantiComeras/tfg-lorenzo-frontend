import { Role } from "../model/role";

export class FetchRoles {
    static readonly type = '[ROLES] Fetch all roles';
    constructor(public payload: { filter: any }) {}
}

export class FetchPermissions {
    static readonly type = '[ROLES] Fetch all permissions';
}

export class AddRole {
    static readonly type = '[ROLES] Create new rol';
    constructor(public payload: {role: Role} ) {}
}

export class UpdateRole {
    static readonly type = '[ROLES] Update a rol';
    constructor(public payload: {oldName:string, role: Role}) {}
}

export class DeleteRole {
    static readonly type = '[ROLES] Delete a rol';
    constructor(public payload: { name: string}) {}
}