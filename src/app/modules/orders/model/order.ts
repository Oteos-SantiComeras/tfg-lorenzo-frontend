import { Cart } from 'src/app/modules/cart/model/cart';

export class Order {
  _id?: string;
  cart: Cart;
  paidOut: boolean;
  name: string;
  secondName: string;
  email: string;
  phone: number;
  country: string;
  address: string;
  zipCode: number;
}