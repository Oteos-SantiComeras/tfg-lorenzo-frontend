import { Permission } from "../model/permission";

export class FetchPermissions {
  static readonly type = "[Permissions] Fetch all permissions";
  constructor(public payload: { filter: any }) {}
}

export class CreatePermission {
  static readonly type = "[Permissions] Create new permission";
  constructor(public payload: { permission: string }) {}
}

export class EditPermission {
  static readonly type = "[Permissions] Edit permission";
  constructor(
    public payload: { oldPermission: string; newPermision: Permission }
  ) {}
}

export class DeletePermission {
  static readonly type = "[Permissions] Delete permission";
  constructor(public payload: { permission: string }) {}
}