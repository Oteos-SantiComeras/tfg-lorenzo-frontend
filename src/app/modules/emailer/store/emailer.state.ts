import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, tap } from "rxjs/operators";
import { EmailerService } from "../emailer.service";
import { SendMail } from "./emailer.actions";

export class EmailerStateModel {
    success: boolean;
}

export const EmailerStateDefaults: EmailerStateModel = {
    success: false,
};

@State<EmailerStateModel>({
    name: 'emailer',
    defaults: EmailerStateDefaults,
})

export class EmailerState {
    constructor(
      private emailerService: EmailerService
    ) {}
  
    @Selector()
    static success(state: EmailerStateModel): boolean {
        return state.success;
    }

    @Action(SendMail)
    public sendMail(
        { patchState }: StateContext<EmailerStateModel>,
        { payload }: SendMail
    ) {
        return this.emailerService.sendMail(payload.message).pipe(
        tap((success: boolean) => {
            patchState({
                success
            });
        }),
        catchError(err => {
            patchState({
                success: false
            });
            throw new Error(err);
        }),
        );
    }
}  