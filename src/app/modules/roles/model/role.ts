import { Permission } from "../../permissions/model/permission";

export class Role {
    name: string;
    permissions: Permission[];
    typeObj?: string;


    public toString = () : string => {
      return `${this.name}`;
  }
  }