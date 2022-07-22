import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, first } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FieldsService {
  entityApi = environment.api + '/api/field';

  constructor(private http: HttpClient) {}

  getFields(
    orderType: string,
    pageIndex: number,
    sortBy: string,
    itemsPerPage: number,
    entityId: number
  ): Observable<GetFieldsResult> {
    return this.http
      .post<GetFieldsResult>(this.entityApi + '/query', {
        sort: {
          byColumn: sortBy,
          direction: orderType,
        },
        pagination: {
          pagination: true,
          itemsPerPage: itemsPerPage,
          pageIndex: pageIndex,
        },
        filters: [
          {
            column: 'entityId',
            value: entityId,
            operation: '=',
            negate: false,
            operator: 'and',
          },
        ],
      })
      .pipe(first());
  }
}

export interface Field {
  id?: number;
  entityId?: number;
  dataBaseOriginId?: number;
  name: string;
}

interface GetFieldsResult {
  message: string;
  code: number;
  content: {
    items?: Field[];
    pageIndex: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}
