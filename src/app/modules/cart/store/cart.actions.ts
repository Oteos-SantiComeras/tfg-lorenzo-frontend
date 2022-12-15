import { Cart } from './../model/cart';

export class FetchCarts {
  static readonly type = "[Carts] Fetch all carts";
  constructor(public payload: { filter: any }) {}
}

export class CreateCart {
  static readonly type = "[Carts] Create new cart";
  constructor(public payload: { cart: Cart }) {}
}

export class EditCart {
  static readonly type = "[Carts] Edit cart";
  constructor(public payload: { _id: string; newCart: Cart }) {}
}

export class DeleteCart {
  static readonly type = "[Carts] Delete cart";
  constructor(public payload: { _id: string }) {}
}

export class SubscribeCartsWS {
  static readonly type = "[Carts] Suscribe carts WS";
}

export class UnSubscribeCartsWS {
  static readonly type = "[Carts] UnSuscribe carts WS";
}