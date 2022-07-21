import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { LoginService } from '../login/service/login.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class MainInterceptor implements HttpInterceptor {
  customSecurity = environment.customSecurity;
  constructor(private loginService: LoginService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let requestToSend = request;
    if (this.loginService.loggedIn()) {
      if (this.customSecurity.useCustomSecurity === true) {
        const customSecureRequest = request.clone({
          ['set' + this.customSecurity.sendTokenIn]: {
            [this.customSecurity.tokenVariableName]:
              this.loginService.getJwtToken() || '',
          },
        });
        requestToSend = customSecureRequest;
      } else {
        const secureRequest = request.clone({
          setHeaders: {
            Authorization: `BEARER ${this.loginService.getJwtToken()}`,
          },
        });
        requestToSend = secureRequest;
      }
    }
    return next.handle(requestToSend).pipe(
      catchError((error) => {
        if (
          (error.status === 401 || error.status === 403) &&
          this.loginService.loggedIn()
        ) {
          if (this.customSecurity.useCustomSecurity === true) {
            this.loginService.logOutCustomSecurity();
          } else {
            this.loginService.logOut();
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
