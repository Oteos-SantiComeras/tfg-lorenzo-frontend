import { NgxsModuleOptions } from "@ngxs/store";
import environment from "./environment";

export const ngxsConfig: NgxsModuleOptions = {
    developmentMode: !environment.production
};