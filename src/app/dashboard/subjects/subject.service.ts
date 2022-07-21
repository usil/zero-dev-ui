import { Observable, first } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  subjectApi = environment.api + '/api/subject';

  constructor(private http: HttpClient) {}

  getSubjects(
    orderType: string,
    pageIndex: number,
    sortBy: string,
    itemsPerPage: number
  ): Observable<GetSubjectsResult> {
    return this.http
      .get<GetSubjectsResult>(
        this.subjectApi +
          `?orderByColumn=${sortBy}&orderType=${orderType}&pageIndex=${pageIndex}&itemsPerPage=${itemsPerPage}`
      )
      .pipe(first());
  }

  createSubject(subject: Subject) {
    return this.http
      .post<PostSubjectResult>(this.subjectApi, {
        inserts: [subject],
      })
      .pipe(first());
  }

  deleteSubject(subjectId: number) {
    return this.http
      .delete(this.subjectApi + `/${subjectId}?identifierColumn=id`)
      .pipe(first());
  }

  updateSubject(subjectId: number, subject: Subject) {
    return this.http
      .put(this.subjectApi + `/${subjectId}`, {
        ...subject,
      })
      .pipe(first());
  }
}

interface GetSubjectsResult {
  message: string;
  code: number;
  content: {
    items?: Subject[];
    pageIndex: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

interface PostSubjectResult {
  message: string;
  code: number;
  content: number[];
}

export interface Subject {
  id?: number;
  identifier: string;
}
