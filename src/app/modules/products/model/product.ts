import { Category } from './../../categories/model/category';

export class Product {
  code: string;
  category: Category;
  name: string;
  description: string;
  price: number;
  tax: number;
  publicSellPrice: number;
  stock: number;
  image: string;
  typeObj?: string;
}