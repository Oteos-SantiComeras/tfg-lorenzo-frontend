import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, map, tap } from "rxjs/operators";
import { CompaniesService } from "../companies.service";
import { Company } from "../model/company";
import { AddNewComapny, FetchCompanies, FetchCompanyByCompanyCode, SubscribeCompaniesWS, UnSubscribeCompaniesWS } from "./companies.actions";

export class CompaniesStateModel {
    companies: Company[];
    company: Company;
    success: boolean;
    notifyChangeCompanies: boolean;
}
  
export const CompaniesStateDefaults: CompaniesStateModel = {
    companies: [],
    company: null,
    success: false,
    notifyChangeCompanies: false,
};

@State<CompaniesStateModel>({
    name: 'companies',
    defaults: CompaniesStateDefaults,
}) 

export class CompaniesState {
    constructor(
      private companiesService: CompaniesService
    ) {}

    @Selector()
    static companies(state: CompaniesStateModel): Company[] {
        return state.companies;
    }

    @Selector()
    static company(state: CompaniesStateModel): Company {
        return state.company;
    }

    @Selector()
    static success(state: CompaniesStateModel): boolean {
        return state.success;
    }

    @Selector()
    static notifyChangeCompanies(state: CompaniesStateModel): boolean {
        return state.notifyChangeCompanies;
    }

    @Action(FetchCompanies)
    public fetchAllCompanies(ctx: StateContext<CompaniesStateModel>) {  
        return this.companiesService.fetchCompanies().pipe(
            map((companiesList: Company[]) => {
                ctx.patchState({ companies: companiesList });
            })
        );
    }

    @Action(FetchCompanyByCompanyCode)
    public fetchCompanyByCompanyCode(
        { patchState }: StateContext<CompaniesStateModel>,
        { payload }: FetchCompanyByCompanyCode
    ) {  
        return this.companiesService.fetchCompanyByCompanyCode(payload.companyCode).pipe(
            tap((company: Company) => {
                if(company){
                    patchState({
                    success: true
                    });
                }else{
                    patchState({
                    success: false
                    });
                }
            }),
            catchError(err => {
                patchState({
                    success: false
                });
                throw new Error(err);
            }),
        );
    }

    @Action(AddNewComapny)
    public addNewCompany(
        { patchState }: StateContext<CompaniesStateModel>,
        { payload }: AddNewComapny
    ) {
        return this.companiesService.createCompany(payload.company).pipe(
        tap((company: Company) => {
            if(company){
                patchState({
                success: true
                });
            }else{
                patchState({
                success: false
                });
            }
        }),
        catchError(err => {
            patchState({
                success: false
            });
            throw new Error(err);
        }),
        );
    }

    @Action(SubscribeCompaniesWS)
    public suscribeCompaniesWS(ctx: StateContext<CompaniesStateModel>) {
        return this.companiesService.getCompaniesBySocket().pipe(
        map((change: boolean) => {
            if(change){
                let state = ctx.getState();
                state = {
                    ...state,
                    notifyChangeCompanies : !state.notifyChangeCompanies
                };
                ctx.setState({
                    ...state,
                });
            }
        })
        )
    }

    @Action(UnSubscribeCompaniesWS)
    public unsuscribeCompaniesWS(ctx: StateContext<CompaniesStateModel>) {
        this.companiesService.removeSocket();
    }
}