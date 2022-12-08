import { AuthState } from './../../store/auth.state';
import { OteosCacheService, OteosToastService, OteosTranslateService, OteosConstantsService, OteosConfigService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { User } from 'src/app/modules/users/model/user';
import { cloneDeep } from 'lodash-es';
import * as moment from 'moment';
import { EditUserPassword, FetchUserByPwdRecovery } from '../../store/auth.actions';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})

export class PasswordRecoveryComponent implements OnInit {

  public pwdRecovery: string; // Url Param
  public user: User; // User Fetched By pwdRecovery Url Param
  public password: string; // Value Input 1
  public confirmPassword: string; // Value Input 2
  
  public type_input_pwd: string;
  public type_input_pwd_confirm: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private cache: OteosCacheService,
    private toastService: OteosToastService,
    public translateService: OteosTranslateService,
    public constants: OteosConstantsService,
    private configservice: OteosConfigService,
  ) { 
    this.cache.setElement("title", this.translateService.getTranslate('label.pwdRecovery.cache.title'));
    this.pwdRecovery = '';
    this.user = new User();
    this.password = '';
    this.confirmPassword = ''; 
    
    this.type_input_pwd = "password";
    this.type_input_pwd_confirm = "password";
  }

  ngOnInit() {
    if (this.route.snapshot.paramMap.has('pwdRecovery')) {
      this.pwdRecovery = this.route.snapshot.paramMap.get('pwdRecovery')
    }

    // Check if Param is reported
    if (!this.pwdRecovery) {
      this.goLogin();
      return;
    }
    
    /* If Param is reported, fetch user by pwd token */
    this.fetchUser();
  }

  /* Store Actions */
  fetchUser() {
    this.store.dispatch(new FetchUserByPwdRecovery({ pwdRecovery: this.pwdRecovery })).subscribe({
      next: async () => {
        const user = this.store.selectSnapshot(AuthState.recoveryUser);
        if(user){
          this.user = cloneDeep(user);

          // If User is fetched OK, Go to initial validation (Token and Time request)
         if (!this.validatePwdRecovery()) {
          this.goLogin();
         }
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.translateService.getTranslate('label.pwdRecovery.fetch.user.error'),
          );

          // If Users if NOT fetched, stop pwd recovery flow and go login
          this.goLogin();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.translateService.getTranslate('label.pwdRecovery.fetch.user.error'),
        );

        // If Users if NOT fetched, stop pwd recovery flow and go login
        this.goLogin();
      }
    });
  }

  editPassword() {
    this.store.dispatch(new EditUserPassword({user: this.user})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(AuthState.success);
        if(success){
          this.toastService.addSuccessMessage(
            this.translateService.getTranslate('label.success.title'),
            this.translateService.getTranslate('label.pwdRecovery.editPwd.success')
          );
          this.goLogin();
        }else{
          this.toastService.addErrorMessage(
            this.translateService.getTranslate('label.error.title'),
            this.translateService.getTranslate('label.pwdRecovery.editPwd.error')
          );
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.addErrorMessage(
          this.translateService.getTranslate('label.error.title'),
          this.translateService.getTranslate('label.pwdRecovery.editPwd.error')
        );
      }
    });
  }

  /* Initial Validation With Fetched User */
  private validatePwdRecovery() {
    let validate: boolean = true;

    // Validate Pwd Date Recovery of the user, Max 3 hour - 180 minutes
    const actualDate = moment(new Date());
    const recoveryDate = moment(new Date(this.user.pwdRecoveryDate));

    const hours:any = actualDate.diff(recoveryDate,'hours')
    const minutes:any = actualDate.diff(recoveryDate,'minutes')

    const maxMinutesExpire: number = this.configservice.getData('pwdRecoveryExpire');

    if ((minutes >= maxMinutesExpire) && validate) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        this.translateService.getTranslate('label.pwdRecovery.validations.expire.time')
      );
      validate = false;
    }

    // Validate Pwd Recovery token Of The User With The Pwd Recovery Token param in URL
    if ((this.pwdRecovery !== this.user.pwdRecoveryToken) && validate) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        this.translateService.getTranslate('label.pwdRecovery.validations.invalid.token')
      );
      validate = false;
    }

    return validate;
  }

  private goLogin() {
    this.router.navigate(['auth/login']);
  }

  /* Form Actions */ 
  onClickFormButon() {
    let errorMsg: string = this.validateForm();
    if (errorMsg) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        errorMsg
      );
      return;
    }

    this.user.password = undefined
    this.user.newPassword = this.confirmPassword;

    this.editPassword();
  }

  onClickComeBack() {
    this.goLogin();
  }

  validateForm() {
    if (!this.password || !this.confirmPassword) { 
      return this.translateService.getTranslate('label.form.fields');
    }

    let pwdPattern: any = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
    if (this.password.length < 8 || this.password.length > 20) {
      return this.translateService.getTranslate('label.form.pwd.length.error');
    }
    if (!pwdPattern.test(this.password)) {
      return this.translateService.getTranslate('label.form.pwd.pattern.error');
    }

    if (this.confirmPassword.length < 8 || this.confirmPassword.length > 20) {
      return this.translateService.getTranslate('label.form.pwd.length.error');
    }
    if (!pwdPattern.test(this.confirmPassword)) {
      return this.translateService.getTranslate('label.form.pwd.pattern.error');
    }
    
    if (this.password !== this.confirmPassword) { 
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
