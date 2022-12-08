import { Category } from './../model/category';

export class FetchCategories {
  static readonly type = "[Categories] Fetch all categories";
  constructor(public payload: { filter: any }) {}
}

export class CreateCategory {
  static readonly type = "[Categories] Create new category";
  constructor(public payload: { category: Category }) {}
}

export class EditCategory {
  static readonly type = "[Categories] Edit category";
  constructor(
    public payload: { name: string; category: Category }
  ) {}
}

export class DeleteCategory {
  static readonly type = "[Categories] Delete category";
  constructor(public payload: { name: string }) {}
}

export class SubscribeCategoriesWS {
  static readonly type = "[Categories] Suscribe categories WS";
}

export class UnSubscribeCategoriesWS {
  static readonly type = "[Categories] UnSuscribe categories WS";
}