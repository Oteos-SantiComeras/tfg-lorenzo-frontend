import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthService } from '../modules/auth/auth.service';
import { AuthState } from '../modules/auth/store/auth.state';

@Pipe({
  name: 'hasPermission'
})

export class HasPermissionPipe implements PipeTransform {

  constructor(
    private authService: AuthService,
    private store: Store
  ) {}

  transform(roles: string[]): any {
    const user = this.store.selectSnapshot(AuthState.loggedUser);
    const hasPermission = this.authService.hasPermission(user, roles);
    return hasPermission;
  }
}
