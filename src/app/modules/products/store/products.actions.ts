import { Product } from './../model/product';

export class FetchProducts {
  static readonly type = "[Products] Fetch all products";
  constructor(public payload: { filter: any }) {}
}

export class CreateProduct {
  static readonly type = "[Products] Create new product";
  constructor(public payload: { product: Product }) {}
}

export class EditProduct {
  static readonly type = "[Products] Edit product";
  constructor(public payload: { code: string; newProduct: Product }) {}
}

export class DeleteProduct {
  static readonly type = "[Products] Delete product";
  constructor(public payload: { code: string }) {}
}

export class SetImageProduct {
  static readonly type = "[Products] Set product image";
  constructor(public payload: { code: string, file: File }) {}
}

export class FetchCategories {
  static readonly type = "[Products] Fetch all categories";
  constructor(public payload: { filter: any }) {}
}