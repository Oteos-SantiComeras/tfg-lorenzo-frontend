import { Role } from "../../roles/model/role";

export class User {
    userName: string;
    password: string;
    newPassword?: string;
    email: string;
    role: Role;
    active?: boolean;
    pwdRecoveryToken?: string;
    pwdRecoveryDate?: Date;
    typeObj?: string;
  }