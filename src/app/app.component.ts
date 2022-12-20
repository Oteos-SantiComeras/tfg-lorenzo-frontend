import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { OteosConstantsService, OteosThemeService, OteosConfigService, OteosCacheService, OteosTranslateService, OteosResolutionService } from 'oteos-components-lib';
import environment from 'src/environments/environment';
import { NavbarOptions } from './models/navbar';
import { AuthState } from './modules/auth/store/auth.state';
import { menuLogout } from './utils/menu-items';
import { Util } from './utils/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'Armeria Tfg Lorenzo';

  public navbarOptions: NavbarOptions;
  
  public subMenuItems: any[];
  public selectedSubTitle: string;
  public activeHover: boolean;

  public showHamburguerMenu: boolean;
  public hamburgerMenuForceClose: boolean;

  constructor(
    public readonly cacheService: OteosCacheService,
    public readonly themeService: OteosThemeService,
    public readonly configService: OteosConfigService,
    public readonly constantsService: OteosConstantsService,
    public readonly translateService: OteosTranslateService,
    public readonly resolutionService: OteosResolutionService,
    private readonly router: Router,
    private readonly store: Store
  ) {
    this.cacheService.setElement("title", ' ');
    this.themeService.changeTheme(this.configService.getData('theme'));

    const token = this.store.selectSnapshot(AuthState.token);
    const user = this.store.selectSnapshot(AuthState.loggedUser);

    if (user && token) {
      const menu = Util.selectMenu(user);
      this.cacheService.setElement("menuItems", menu);
    } else {
      this.cacheService.setElement("menuItems", menuLogout);
    }

    this.subMenuItems = [];
    this.selectedSubTitle = "";
    this.activeHover = false;

    this.showHamburguerMenu = false;
    this.hamburgerMenuForceClose = false;

    this.navbarOptions = new NavbarOptions(true, true);
  }

  /* BLOCK MENU */
  onMenuItemClick(item: any) {
    this.onLeftMenu();
    this.router.navigateByUrl(item.route);
  }

  onMenuItemHover(item: any) {
    this.onLeftMenu();
    this.activeHover = true;
    if (!item.children)
      return;

    item.children.forEach(item => {
      let i: any = {
        text: item.text,
        route: item.route,
        icon: item.icon
      }

      this.subMenuItems.push(i);
    });

    if (this.subMenuItems.length > 0) {
      this.selectedSubTitle = item.text;
    }
  }

  onLeftMenu() {
    this.selectedSubTitle = "";
    this.subMenuItems = [];
    this.activeHover = false;
  }
}
