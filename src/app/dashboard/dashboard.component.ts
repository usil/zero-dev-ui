import { GeneralService } from './general.service';
import { Router } from '@angular/router';
import { LoginService } from './../login/service/login.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import routes from './routes';
import { environment } from 'src/environments/environment';
import {
  fromEvent,
  distinctUntilChanged,
  debounceTime,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  mobileQuery: MediaQueryList;
  routesList = routes;
  title = environment.title;
  username: string;
  tablesPanelOpen = false;
  authPanelOpen = false;
  isAdminUser: boolean;
  private _mobileQueryListener: () => void;
  documentClick = fromEvent(document, 'click');
  clickSubscription!: Subscription;
  customSecurity = environment.customSecurity;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private loginService: LoginService,
    private router: Router,
    private generalService: GeneralService
  ) {
    if (this.customSecurity.useCustomSecurity === true) {
      this.clickSubscription = this.documentClick
        .pipe(distinctUntilChanged(), debounceTime(5000))
        .subscribe(() => this.generalService.ping().subscribe());
    }
    console.log(this.loginService.getRoles());
    this.isAdminUser = this.loginService.getRoles()?.indexOf('admin') !== -1;
    this.username = this.loginService.getUsername() || '';
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.clickSubscription?.unsubscribe();
  }

  ngOnInit(): void {}

  logOut() {
    this.loginService.logOut();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([`${route}`]);
  }
}
