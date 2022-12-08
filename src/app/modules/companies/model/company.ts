import { Contact } from "./contact";

export class Company {
    companyCode: string;
    name: string;
    nif: string;
    contacts: Contact[];
    extension?: any;
}