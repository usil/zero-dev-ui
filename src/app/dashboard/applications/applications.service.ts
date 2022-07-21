import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, first } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  subjectApi = environment.api + '/api/application';

  constructor(private http: HttpClient) {}

  getApplications(
    orderType: string,
    pageIndex: number,
    sortBy: string,
    itemsPerPage: number
  ): Observable<GetApplicationResult> {
    return this.http
      .get<GetApplicationResult>(
        this.subjectApi +
          `?orderByColumn=${sortBy}&orderType=${orderType}&pageIndex=${pageIndex}&itemsPerPage=${itemsPerPage}`
      )
      .pipe(first());
  }

  getApplication(applicationId: number) {
    return this.http
      .get<GetOneApplicationResult>(this.subjectApi + `/${applicationId}`)
      .pipe(first());
  }

  createApplication(application: Application) {
    return this.http
      .post<PostApplicationResult>(this.subjectApi, {
        inserts: [application],
      })
      .pipe(first());
  }

  deleteApplication(subjectId: number) {
    return this.http
      .delete(this.subjectApi + `/${subjectId}?identifierColumn=id`)
      .pipe(first());
  }

  updateApplication(applicationId: number, application: Application) {
    return this.http
      .put(this.subjectApi + `/${applicationId}`, {
        ...application,
      })
      .pipe(first());
  }
}

export interface Application {
  id?: number;
  version: string;
  name: string;
  port: string;
  cpu: number;
  memory: number;
}

interface PostApplicationResult {
  message: string;
  code: number;
  content: number[];
}

interface GetApplicationResult {
  message: string;
  code: number;
  content: {
    items?: Application[];
    pageIndex: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

interface GetOneApplicationResult {
  message: string;
  code: number;
  content: Application;
}
