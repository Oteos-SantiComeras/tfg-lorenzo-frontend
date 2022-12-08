import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { OteosSelectItem, OteosCacheService, OteosThemeService, OteosConfigService, OteosTranslateService } from 'oteos-components-lib';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsComponent),
      multi: true
    }
  ]
})
export class OptionsComponent implements OnInit {

  public themeSelected: string;
  public themes: OteosSelectItem[];

  constructor(
    private readonly configService: OteosConfigService,
    private readonly cacheService: OteosCacheService,
    private readonly themeService: OteosThemeService,
    public readonly translateService: OteosTranslateService,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.options.cache.title'));

    this.themeSelected = '';
    this.themes = [];
  }

  ngOnInit() {
    this.themes = [
      {label: this.translateService.getTranslate('label.themes.theme.default'), value: "theme-default"},
      {label: this.translateService.getTranslate('label.themes.theme.dark'), value: "theme-dark"},
      {label: this.translateService.getTranslate('label.themes.theme.blue'), value: "theme-blue"},
    ];
  }

  selectTheme($event) {
    this.themeService.changeTheme(this.themeSelected);
  }

  onClickDefaultsOptions() {
    // Theme
    this.themeService.changeTheme(this.configService.getData('theme'));
  }
}
