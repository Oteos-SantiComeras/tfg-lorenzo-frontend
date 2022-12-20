import { CategoriesService } from './../categories.service';
import { Category } from './../model/category';
import { OteosTranslateService } from 'oteos-components-lib';
import { Pagination } from '../../../models/pagination';
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap } from "rxjs/operators";
import { CreateCategory, DeleteCategory, EditCategory, FetchCategories } from './categories.actions';

export class CategoriesStateModel {
  categories: Category[];
  success: boolean;
  notifyChangeCategories: boolean;
  errorMsg: string;
  successMsg: string;
}

export const CategoriesStateDefault: CategoriesStateModel = {
  categories: [],
  success: false,
  notifyChangeCategories: false,
  errorMsg: '',
  successMsg: '',
};

@State<CategoriesStateModel>({
  name: "categories",
  defaults: CategoriesStateDefault,
})

@Injectable()
export class CategoriesState {

  constructor(
    private readonly translateService: OteosTranslateService,
    private readonly categoriesService: CategoriesService,
  ) {
    
  }

  @Selector()
  static categories(state: CategoriesStateModel): Category[] {
    return state.categories;
  }

  @Selector()
  static success(state: CategoriesStateModel): boolean {
    return state.success;
  }
  @Selector()
  static notifyChangeCategories(state: CategoriesStateModel): boolean {
    return state.notifyChangeCategories;
  }

  @Selector()
  static errorMsg(state: CategoriesStateModel): string {
    return state.errorMsg;
  }

  @Selector()
  static successMsg(state: CategoriesStateModel): string {
    return state.successMsg;
  }
  
  @Action(FetchCategories)
  public fetchCategories (
    { patchState }: StateContext<CategoriesStateModel>,
    { payload }: FetchCategories
  ) {
    return this.categoriesService.fetchCategories(payload.filter).pipe(
      map((pagination: Pagination) => {
        const categories: any[] = pagination.items;
        patchState({
          categories: categories
        });
      })
    );
  }

  @Action(CreateCategory)
  public createCategory(
    { patchState }: StateContext<CategoriesStateModel>,
    { payload }: CreateCategory
  ) {
    return this.categoriesService.createCategory(payload.category).pipe(
      tap((category: Category) => {
        if (category) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.categories.create.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.categories.create.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Category " + payload.category.name + " already exist")) {
          errorMSg = this.translateService.getTranslate('label.categories.create.already.exist');
        } else {
          errorMSg = this.translateService.getTranslate('label.categories.create.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });

        throw new Error(err);
      })
    );
  }

  @Action(EditCategory)
  public editCategory(
    { patchState }: StateContext<CategoriesStateModel>,
    { payload }: EditCategory
  ) {
    return this.categoriesService
      .editCategory(payload.name, payload.category)
      .pipe(
        tap((category: Category) => {
          if (category) {
            patchState({
              success: true,
              errorMsg: '',
              successMsg: this.translateService.getTranslate('label.categories.update.success'),
            });
          } else {
            patchState({
              success: false,
              errorMsg: this.translateService.getTranslate('label.categories.update.error'),
              successMsg: '',
            });
          }
        }),
        catchError((err) => {
          let errorMSg: string = '';
          if (err.error.message == ("Category " + payload.name + " not found")) {
            errorMSg = this.translateService.getTranslate('label.categories.update.not.found');
          } else if (err.error.message == ("Category " + payload.category.name + " already exist")) {
            errorMSg = this.translateService.getTranslate('label.categories.update.already.exist');
          } else {
            errorMSg = this.translateService.getTranslate('label.categories.update.error');
          }

          patchState({
            success: false,
            errorMsg: errorMSg,
            successMsg: '',
          });
        
          throw new Error(err);
        })
      );
  }

  @Action(DeleteCategory)
  deleteCategory(
    { patchState }: StateContext<CategoriesStateModel>,
    { payload }: DeleteCategory
  ) {
    return this.categoriesService.deleteCategory(payload.name)
      .pipe(tap((res: boolean) => {
        if (res) {
          patchState({
            success: true,
            errorMsg: '',
            successMsg: this.translateService.getTranslate('label.categories.delete.success'),
          });
        } else {
          patchState({
            success: false,
            errorMsg: this.translateService.getTranslate('label.categories.delete.error'),
            successMsg: '',
          });
        }
      }),
      catchError((err) => {
        let errorMSg: string = '';

        if (err.error.message == ("Category " + payload.name + " not found")) {
          errorMSg = this.translateService.getTranslate('label.categories.delete.not.found');
        } else {
          errorMSg = this.translateService.getTranslate('label.categories.delete.error');
        }

        patchState({
          success: false,
          errorMsg: errorMSg,
          successMsg: '',
        });
      
        throw new Error(err);
      }));
  }
}

