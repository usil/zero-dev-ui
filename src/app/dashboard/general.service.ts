import { first } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  customSecurity = environment.customSecurity;

  constructor(private http: HttpClient) {}

  ping() {
    return this.http
      .get(this.customSecurity.baseUrl + this.customSecurity.pingEndpoint)
      .pipe(first());
  }
}
