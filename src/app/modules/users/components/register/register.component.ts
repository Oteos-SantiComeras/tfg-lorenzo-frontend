import { Message } from './../../../emailer/model/message';
import { AddNewUserNoAuth, SendRegisterEmail } from './../../store/users.actions';
import { User } from '../../model/user';
import { Router } from '@angular/router';
import { OteosCacheService, OteosConstantsService, OteosSelectItem, OteosSpinnerService, OteosToastService, OteosTranslateService, OteosConfigService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { UsersState } from '../../store/users.state';
import { Role } from 'src/app/modules/roles/model/role';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  private subManager: Subscription;

  /* */
  public newUser: User;
  public pwdConfirm: string;

  public type_input_pwd: string;
  public type_input_pwd_confirm: string;

  constructor(
    private readonly configService: OteosConfigService,
    private readonly cacheService: OteosCacheService,
    public readonly translateService: OteosTranslateService,
    private readonly spinnerService: OteosSpinnerService,
    private readonly toastService: OteosToastService,
    private readonly constantsService: OteosConstantsService,
    private readonly store: Store,
    private readonly router: Router
  ) {
    this.cacheService.setElement("title", this.translateService.getTranslate('label.register.cache.title'));
    this.subManager = new Subscription();


    this.newUser = new User();
    this.pwdConfirm = '';

    this.type_input_pwd = "password";
    this.type_input_pwd_confirm = "password";
  }

  ngOnInit() {

  }

  /* Store Functions */
  createUser($event: User){  
    this.spinnerService.showSpinner();

    this.store.dispatch(new AddNewUserNoAuth({ user: $event })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(UsersState.success);

        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.store.selectSnapshot(UsersState.successMsg)
          );

          this.sendRegisterEmail($event);
          this.onClickComeBack();
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.store.selectSnapshot(UsersState.errorMsg)
          );
        }

        this.spinnerService.hideSpinner();
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.store.selectSnapshot(UsersState.errorMsg)
        );

        this.spinnerService.showSpinner();
      }
    });
  }

  sendRegisterEmail(user: User) {
    let emailBody: string = "";
    emailBody += `<!DOCTYPE html>`;
    emailBody += `<html>`;
    emailBody += `  <head>`;
    emailBody += `    <style>`;
    emailBody += `      h3 { color: #002c77; }`;
    emailBody += `    </style>`;
    emailBody += `  </head>`;
    emailBody += `  <body>`;
    emailBody += `    <h3>¡${this.translateService.getTranslate('label.general.welcome')} ${user.userName}!</h3>`;
    emailBody += `    <p>${this.translateService.getTranslate('label.register.email.text.1')}</p>`;
    emailBody += `  </body>`;
    emailBody += `</html>`;

    let message: Message = new Message();
    message.subject = `${this.translateService.getTranslate('label.register.email.subject.app.title')} - ${this.translateService.getTranslate('label.register.email.subject')}`;
    message.receivers = [ user.email ];
    message.text = emailBody;

    this.store.dispatch(new SendRegisterEmail({ message: message })).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(UsersState.success);

        if(success){
          /* this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.translateService.getTranslate('label.register.send.email.succuess')
          ); */
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.translateService.getTranslate('label.register.send.email.error')
          );
        }
        this.spinnerService.hideSpinner();
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.translateService.getTranslate('label.register.send.email.errror')
        );

        this.spinnerService.showSpinner();
      }
    });
  }

  /* Form Actions */
  onClickComeBack() {
    this.router.navigateByUrl("/auth/login");
  }

  onClickFormButon() {
    // Check si hay errores en el formulario
    let errorMsg: string = this.validateDetailFormFields();
    if (errorMsg) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        errorMsg
      );
      return;
    }

    let userRole: Role = new Role();
    userRole.name = "USER";

    this.newUser.role = userRole;
    this.newUser.active = true;

    this.createUser(this.newUser);
  }

  private validateDetailFormFields() {
    /* Empty Values Validation */
    if (!this.newUser.userName) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (!this.newUser.email) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (!this.newUser.password) {
      return this.translateService.getTranslate('label.form.fields');
    }
    if (!this.pwdConfirm) {
      return this.translateService.getTranslate('label.form.fields');
    }

    /* User Name Validations */
    if (this.newUser.userName.length < 4 || this.newUser.userName.length > 20) {
      return this.translateService.getTranslate('label.form.name.length.error');
    }

    /* Email Validations */
    let emailPattern: any = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    if (!emailPattern.test(this.newUser.email)) {
      return this.translateService.getTranslate('label.form.email.bad.format');
    }

    /* Password Validation */
    let pwdPattern: any = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
    if (this.newUser.password.length < 8 || this.newUser.password.length > 20) {
      return this.translateService.getTranslate('label.form.pwd.length.error');
    }
    if (!pwdPattern.test(this.newUser.password)) {
      return this.translateService.getTranslate('label.form.pwd.pattern.error');
    }

    if (this.pwdConfirm.length < 8 || this.pwdConfirm.length > 20) {
      return this.translateService.getTranslate('label.form.pwd.length.error');
    }
    if (!pwdPattern.test(this.pwdConfirm)) {
      return this.translateService.getTranslate('label.form.pwd.pattern.error');
    }

    if (this.newUser.password != this.pwdConfirm) {
      return this.translateService.getTranslate('label.form.pwds.not.equals');
    }

    return '';
  }

  showHidePassowrd(confirmPwd: boolean = false) {
    if (!confirmPwd) {
      if (this.type_input_pwd == 'password') {
        this.type_input_pwd = 'text';
      } else {
        this.type_input_pwd = 'password';
      }
    } else {
      if (this.type_input_pwd_confirm == 'password') {
        this.type_input_pwd_confirm = 'text';
      } else {
        this.type_input_pwd_confirm = 'password';
      }
    }
  }
}
