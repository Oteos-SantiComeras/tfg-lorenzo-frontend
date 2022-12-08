import { OteosToastService, OteosTranslateService } from 'oteos-components-lib';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthState } from '../modules/auth/store/auth.state';
import { roleList } from '../constants/roles.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router,
    private toastService: OteosToastService,
    private translateService: OteosTranslateService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = this.store.selectSnapshot(AuthState.token);
    const user = this.store.selectSnapshot(AuthState.loggedUser);
    const expectedRole: string[] = route.data['roles'] || [];

    if (!token || !user) {
      this.router.navigate(['/auth', 'login']);
      return false;
    }

    // Root siempre tiene acceso
    expectedRole.push(roleList.ADMIN);
    expectedRole.push(roleList.SUPERADMIN)
    const roleHasAccess = expectedRole
      .map((roleEx) => user.role.name === roleEx)
      .some((res) => res);

    if (!roleHasAccess) {
      this.toastService.addErrorMessage(
        this.translateService.getTranslate('label.error.title'),
        this.translateService.getTranslate('label.auth.no.permissions')
      );

      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
