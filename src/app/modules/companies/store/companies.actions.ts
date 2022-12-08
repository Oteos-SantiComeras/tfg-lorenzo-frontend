import { Company } from "../model/company";

export class FetchCompanies{
    static readonly type = '[COMPANY] Fetch all companies';
}

export class FetchCompanyByCompanyCode {
    static readonly type = '[COMPANY] Fetch company by company code';
    constructor(public payload: { companyCode: string }) {}
}

export class AddNewComapny {
    static readonly type = '[COMPANY] Create new company';
    constructor(public payload: {company: Company} ) {}
}

export class SubscribeCompaniesWS{
    static readonly type = '[COMPANY] Subscribe company WS'
}

export class UnSubscribeCompaniesWS {
    static readonly type = '[COMPANY] UnSubscribe company WS';
}