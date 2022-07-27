import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { JSONPath } from 'jsonpath-plus';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  authApi = environment.api + '/auth';
  customSecurity = environment.customSecurity;

  constructor(private http: HttpClient) {}

  login(userLoginInfo: {
    password: string;
    username: string;
  }): Observable<LoginResult> {
    const loginUrl = this.authApi + '/login';
    return this.http.post<LoginResult>(loginUrl, userLoginInfo).pipe(
      first(),
      tap((loginResult) => this.saveLogin(loginResult))
    );
  }

  saveLogin(loginResult: LoginResult) {
    localStorage.setItem('name', loginResult.content?.name as string);
    localStorage.setItem('username', loginResult.content?.username as string);
    localStorage.setItem('jwt_token', loginResult.content?.jwt_token as string);
    localStorage.setItem('userId', loginResult.content?.userId as string);
    localStorage.setItem('roles', loginResult.content?.roles.join('|||') || '');
  }

  logOutCustomSecurity() {
    const logOutUrl =
      this.customSecurity.baseUrl + this.customSecurity.loginEndpoint;

    window.location.href = logOutUrl;
  }

  logOut() {
    if (this.customSecurity.useCustomSecurity) {
      this.logOutCustomSecurity();
      return;
    }
    localStorage.removeItem('name');
    localStorage.removeItem('username');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('roles');
  }

  loggedIn() {
    const allData = { settings: { ...environment } };

    if (this.customSecurity.useCustomSecurity) {
      const token = JSONPath({
        path: this.customSecurity.sessionInfoConfig.jsonPathToToken,
        json: allData,
      })[0];
      return !!token;
    }
    return !!localStorage.getItem('jwt_token');
  }

  getJwtToken() {
    const allData = { settings: { ...environment } };
    if (this.customSecurity.useCustomSecurity) {
      const token = JSONPath({
        path: this.customSecurity.sessionInfoConfig.jsonPathToToken,
        json: allData,
      })[0];
      return token as string;
    }
    return localStorage.getItem('jwt_token');
  }

  getUsername() {
    const allData = { settings: { ...environment } };
    if (this.customSecurity.useCustomSecurity) {
      return JSONPath({
        path: this.customSecurity.sessionInfoConfig.jsonPathToUser,
        json: allData,
      })[0];
    }
    return localStorage.getItem('username');
  }

  getRoles() {
    const allData = { settings: { ...environment } };
    console.log(allData);
    console.log(this.customSecurity.sessionInfoConfig.jsonPathToRoles);
    if (this.customSecurity.useCustomSecurity) {
      const rolesArray = JSONPath({
        path: this.customSecurity.sessionInfoConfig.jsonPathToRoles,
        json: allData,
      });
      console.log(rolesArray);
      return rolesArray as string[];
    }
    const roles = localStorage.getItem('roles');
    return roles?.split('|||');
  }
}

interface LoginResult {
  message: string;
  code: number;
  content?: UserLogin;
}

interface UserLogin {
  userId: string;
  username: string;
  name: string;
  jwt_token: string;
  roles: string[];
}
