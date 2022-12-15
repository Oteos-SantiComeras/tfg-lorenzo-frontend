import { Order } from './../model/order';
export class FetchOrders {
  static readonly type = "[Orders] Fetch all orders";
  constructor(public payload: { filter: any }) {}
}

export class CreateOrder {
  static readonly type = "[Orders] Create new order";
  constructor(public payload: { order: Order }) {}
}

export class EditOrder {
  static readonly type = "[Orders] Edit order";
  constructor(public payload: { _id: string; newOrder: Order }) {}
}

export class DeleteOrder {
  static readonly type = "[Orders] Delete order";
  constructor(public payload: { _id: string }) {}
}

export class SubscribeOrdersWS {
  static readonly type = "[Orders] Suscribe orders WS";
}

export class UnSubscribeOrdersWS {
  static readonly type = "[Orders] UnSuscribe orders WS";
}