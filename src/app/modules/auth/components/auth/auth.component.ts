import { User } from './../../../users/model/user';
import { Message } from './../../../emailer/model/message';
import { Router } from '@angular/router';
import { LoginDto } from './../../model/login.dto';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ILogin, OteosCacheService, OteosToastService, OteosConstantsService, OteosTranslateService, OteosModalService, OteosSpinnerService, OteosConfigService } from 'oteos-components-lib';
import { Login, PasswordRecovery, SendPasswordRecoveryEmail } from '../../store/auth.actions';
import { first } from 'rxjs';
import { AuthState } from '../../store/auth.state';
import { Store } from '@ngxs/store';
import { Util } from 'src/app/utils/util';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import environment from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthComponent),
      multi: true
    }
  ]
})
export class AuthComponent implements OnInit {

  public emailRecovery: string;

  constructor(
    private readonly configService: OteosConfigService,
    private readonly spinnerService: OteosSpinnerService,
    private readonly toastService: OteosToastService,
    public readonly translateService: OteosTranslateService,
    public readonly cacheService: OteosCacheService,
    public readonly constantsService: OteosConstantsService,
    private readonly modalService: OteosModalService,
    private readonly store: Store,
    private readonly router: Router
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.auth.cache.title'));

    this.emailRecovery = '';
  }

  ngOnInit() {

  }
  // PasswordRecovery
  /* Store Actions */
  login(login: LoginDto) {
    this.store.dispatch(new Login(login)).pipe(first()).subscribe({
      next: () => {
        this.toastService.addSuccessMessage(
          this.translateService.getTranslate("label.success.title"),
          this.translateService.getTranslate("label.auth.form.success")
        );

        const user = this.store.selectSnapshot(AuthState.loggedUser);
        const menu = Util.selectMenu(user);

        this.cacheService.setElement('menuItems', menu);
        
        if (user.role.name == "ADMIN" || user.role.name == "SUPERADMIN") {
          this.router.navigate(['products']);
        } else {
          this.router.navigate(['products-list']);
        }
      }, error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.translateService.getTranslate("label.auth.form.bad.request")
        );
      }
    });
  }

  passwordRecovery(email: string) {
    this.store.dispatch(new PasswordRecovery({email})).pipe(first()).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(AuthState.success);

        if (success) {
          /* this.toastService.addSuccessMessage(
            this.translateService.getTranslate("label.success.title"),
            this.translateService.getTranslate('label.auth.pwd.recovery.success')
          ); */
  
          const recoveryUser: User = this.store.selectSnapshot(AuthState.recoveryUser);
          this.sendPwdRecoveryEmail(recoveryUser);
        } else {
          this.toastService.addErrorMessage(
            this.translateService.getTranslate("label.error.title"),
            this.translateService.getTranslate('label.auth.pwd.recovery.error')
          );
        }
      }, error: () => {
        this.toastService.addErrorMessage(
          this.translateService.getTranslate("label.error.title"),
          this.translateService.getTranslate('label.auth.pwd.recovery.error')
        );
      }
    });
  }

  sendPwdRecoveryEmail(user: User) {
    this.spinnerService.showSpinner();

    let link: string = `${environment.httpsEnabled ? 'https://' : 'http://'}`;
    link += `${environment.hostname}:${environment.appPort}`;
    link += `/#/auth/recovery/${user.pwdRecoveryToken}`;

    let emailBody: string = "";
    emailBody += `<!DOCTYPE html>`;
    emailBody += `<html>`;
    emailBody += `  <head>`;
    emailBody += `    <style>`;
    emailBody += `      h3 { color: #002c77; }`;
    emailBody += `    </style>`;
    emailBody += `  </head>`;
    emailBody += `  <body>`;
    emailBody += `    <h3>¡${this.translateService.getTranslate('label.general.hello')} ${user.userName}!</h3>`;
    emailBody += `    <p>`;
    emailBody += `      ${this.translateService.getTranslate('label.auth.pwd.recovery.email.text.1')} <br>`;
    emailBody += `      ${this.translateService.getTranslate('label.auth.pwd.recovery.email.text.2')} <br>`;
    emailBody += `      ${this.translateService.getTranslate('label.auth.pwd.recovery.email.text.3')}: `;
    emailBody += `      <a href="${link}" target="_blank">${this.translateService.getTranslate('label.auth.pwd.recovery.email.text.link')}</a> <br>`
    emailBody += `    </p>`;
    emailBody += `  </body>`;
    emailBody += `</html>`;

    let message: Message = new Message();
    message.subject = `${this.translateService.getTranslate('label.auth.pwd.recovery.email.subject.app.title')} - ${this.translateService.getTranslate('label.auth.pwd.recovery.email.subject')}`;
    message.receivers = [ user.email ];
    message.text = emailBody;

    this.store.dispatch(new SendPasswordRecoveryEmail({ message: message })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(AuthState.success);

        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.translateService.getTranslate('label.auth.pwd.recovery.email.success')
          );

        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.translateService.getTranslate('label.auth.pwd.recovery.email.error')
          );
        }

        this.spinnerService.hideSpinner();
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.translateService.getTranslate('label.auth.pwd.recovery.email.error')
        );

        this.spinnerService.hideSpinner();
      }
    });

    this.spinnerService.hideSpinner();
  }

  /* Login Actions */
  onCancelButton() {

  }

  onConfirmButton($event: ILogin) {
    if (!$event.userName || !$event.password) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate("label.error.title"), 
        this.translateService.getTranslate("label.form.fields")
      );
      return;
    }

    const login: LoginDto = {
      userName: $event.userName,
      password: $event.password
    }

    this.login(login);
  }

  onPwdRecovery() {
    this.emailRecovery = '';
    this.modalService.open("pwd-recovery");
  }

  onRegisterUser() {
    this.router.navigateByUrl("/users/register");
  }

  /* Modal Pwd Recovery Actions */
  onCloseModal($event) {
    this.emailRecovery = '';
  }

  onConfirmModal($event) {
    let errorMsg: string = this.validateDetailFormFields();
    if (errorMsg) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        errorMsg
      );
      return;
    }

    this.passwordRecovery(this.emailRecovery);
  }

  /* Form Actions */
  private validateDetailFormFields() {
    /* Empty Values Validation */
    if (!this.emailRecovery) {
      return this.translateService.getTranslate('label.form.fields');
    }

    /* Email Validations */
    let emailPattern: any = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    if (!emailPattern.test(this.emailRecovery)) {
      return this.translateService.getTranslate('label.form.email.bad.format');
    }
  
    return '';
  }
}