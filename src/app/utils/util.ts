import { roleList } from "../constants/roles.constants";
import { User } from "../modules/users/model/user";
import { menuAdmin, menuUser, menuSuperAdmin } from "./menu-items";

export class Util {

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