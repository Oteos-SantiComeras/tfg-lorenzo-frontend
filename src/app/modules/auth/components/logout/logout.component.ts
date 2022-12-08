import { OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout } from '../../store/auth.actions';

@Component({
  template: ''
})
export class LogoutComponent implements OnInit {
  constructor(
    private store: Store,
    private router: Router,
    private toastService: OteosToastService,
    private translateService: OteosTranslateService
  ) {}

  ngOnInit(): void {
    this.toastService.addSuccessMessage(
      this.translateService.getTranslate('label.success.title'), 
      this.translateService.getTranslate('label.auth.close.session')
    );

    this.store.dispatch(new Logout());
    this.router.navigate(['/auth/login']);
  }
}
