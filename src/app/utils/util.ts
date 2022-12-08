import { roleList } from "../constants/roles.constants";
import { Diff } from "../models/diff";
import { User } from "../modules/users/model/user";
import { menuAdmin, menuUser, menuSuperAdmin } from "./menu-items";

export class Util {

    /**
     * Return diff two objects
     * {
     *  property: property has changed,
     *  old: old value of property,
     *  new: new value of property
     * }
     * @param oldData 
     * @param newData 
     * @param result 
     */
    static diff(oldData, newData, result) {
        Object.keys(oldData).forEach(function (k) {
            if (typeof oldData[k] !== 'object' || !oldData[k]) {
              if (oldData[k] != newData[k]){
                const diff: Diff = {'property': k,'old': oldData[k], 'new': newData[k]};
                this.push(diff);
              } 
            } else {
                Util.diff(oldData[k], newData[k], this);
            }
        }, result);
        return result;
    }


    static selectMenu(user: User): any[]{
        switch(user.role.name) {
            case roleList.SUPERADMIN:
                return menuSuperAdmin;
                break;
            case roleList.ADMIN:
                return menuAdmin;
                break;
            case roleList.USER:
                return menuUser;
                break;
            default:
                return null;
                break;
        }
    }
}