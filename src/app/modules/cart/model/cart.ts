import { User } from './../../users/model/user';
import { Product } from "../../products/model/product";

export class Cart {
    _id?: string;
    user: User;
    products?: Product[];
    amounts?: number[];
    totalItems?: number;
    totalPrice?: number;
    totalPriceTaxs?: number;
}