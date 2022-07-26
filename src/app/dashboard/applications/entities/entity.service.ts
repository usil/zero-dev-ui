import { Subject } from './../../subjects/subject.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AxiosRequestConfig } from 'axios';
import { environment } from 'src/environments/environment';
import { Observable, first, map, mergeMap, of, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EntityService {
  entityApi = environment.api + '/api/entity';
  subjectEntityApi = environment.api + '/api/subject_entity_configuration';
  entityDataOriginApi = environment.api + '/api/entity_data_origin';
  externalOriginApi = environment.api + '/api/external_origin';
  externalPaginationApi = environment.api + '/api/pagination_config';
  createTableApi = environment.api + '/api/zero-code/table';

  constructor(private http: HttpClient) {}

  getDataOriginFromEntity(entityId: number) {
    return this.http
      .post<GetDataOriginFromEntity>(
        this.entityDataOriginApi + '/query?pagination=false',
        {
          filters: [
            {
              column: 'entityId',
              value: entityId,
              operation: '=',
              negate: false,
              operator: 'and',
            },
          ],
        }
      )
      .pipe(
        mergeMap((res) => {
          if (res.content[0]) {
            const dataOrigin = res.content[0];
            if (dataOrigin.type === 'external') {
              return this.getExternalDataOriginFromDataOriginId(res.content[0]);
            }
            return of({
              type: dataOrigin.type,
              id: dataOrigin.id,
            });
          }
          return of(null);
        }),
        first()
      );
  }

  getExternalDataOriginFromDataOriginId(entityDataOrigin: {
    type: string;
    entityId: number;
    id: number;
  }) {
    return this.http
      .post<GetExternalDataOriginFromDataOrigin>(
        this.externalOriginApi + '/query?pagination=false',
        {
          filters: [
            {
              column: 'entityDataOriginId',
              value: entityDataOrigin.id,
              operation: '=',
              negate: false,
              operator: 'and',
            },
          ],
        }
      )
      .pipe(
        mergeMap((res) => {
          if (res.content[0]) {
            return this.getPaginationFromExternalDataOrigin(
              entityDataOrigin,
              res.content[0]
            );
          }
          return of(null);
        }),
        first()
      );
  }

  getPaginationFromExternalDataOrigin(
    entityDataOrigin: {
      type: string;
      entityId: number;
      id: number;
    },
    externalDataOrigin: {
      id: number;
      entityDataOriginId: number;
      primaryKey: string;
      restHttpConfig: AxiosRequestConfig<any>;
      getOneJsonPath: string;
      errorJsonPath: string;
      queryUrl?: string;
    }
  ) {
    return this.http
      .post<GetPaginationFromExternalDataOrigin>(
        this.externalPaginationApi + '/query?pagination=false',
        {
          filters: [
            {
              column: 'externalOriginId',
              value: externalDataOrigin.id,
              operation: '=',
              negate: false,
              operator: 'and',
            },
          ],
        }
      )
      .pipe(
        map((res) => {
          if (res.content[0]) {
            return {
              id: entityDataOrigin.id,
              type: entityDataOrigin.type,
              externalDataOrigin: {
                id: externalDataOrigin.id,
                errorJsonPath: externalDataOrigin.errorJsonPath,
                getOneJsonPath: externalDataOrigin.getOneJsonPath,
                primaryKey: externalDataOrigin.primaryKey,
                queryUrl: externalDataOrigin.queryUrl,
                restHttpConfig: externalDataOrigin.restHttpConfig,
                pagination: {
                  id: res.content[0].id,
                  itemsPerPageField: res.content[0].itemsPerPageField,
                  jsonPathToItems: res.content[0].jsonPathToItems,
                  jsonPathToTotalItems: res.content[0].jsonPathToTotalItems,
                  pageIndexField: res.content[0].pageIndexField,
                  sendPaginationInfoIn: res.content[0].sendPaginationInfoIn,
                },
              },
            };
          }
          return null;
        }),
        first()
      );
  }

  getEntities(
    orderType: string,
    pageIndex: number,
    sortBy: string,
    itemsPerPage: number,
    applicationId: number
  ): Observable<GetEntitiesResult> {
    return this.http
      .post<GetEntitiesResult>(this.entityApi + '/query', {
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
            column: 'applicationId',
            value: applicationId,
            operation: '=',
            negate: false,
            operator: 'and',
          },
        ],
      })
      .pipe(first());
  }

  getEntity(id: number) {
    return this.http.get<GetOneEntityResult>(this.entityApi + `/${id}`);
  }

  createEntity(createEntityData: CreateEntityData, applicationId: number) {
    return this.http
      .post<PostEntityResult>(this.entityApi, {
        inserts: [
          {
            applicationId,
            name: createEntityData.name,
            icon: createEntityData.icon,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            return forkJoin({
              subjects: this.createSubjectEntityRelationship(
                createEntityData.subjects_crud,
                res.content[0]
              ),
              dataOrigin: this.createDataOrigin(
                createEntityData,
                res.content[0]
              ),
            });
          }
          return of(null);
        }),
        mergeMap((res) => {
          console.log(res);
          return this.createTable(createEntityData.name, {});
        })
      );
  }

  createTable(
    tableName: string,
    columns: Record<string, TableCreationColumn>,
    primaryKey = 'id'
  ) {
    return this.http
      .post(this.createTableApi, {
        tableName,
        columns,
        primaryKey,
      })
      .pipe(first());
  }

  createDataOrigin(createEntityData: CreateEntityData, entityId: number) {
    return this.http
      .post<PostEntityResult>(this.entityDataOriginApi, {
        inserts: [
          {
            entityId,
            type: createEntityData.data_origin,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            if (createEntityData.data_origin === 'external') {
              return this.createExternalOrigin(
                createEntityData,
                res.content[0]
              );
            }
            return of(res);
          }
          return of(null);
        })
      );
  }

  createExternalOrigin(
    createEntityData: CreateEntityData,
    entityDataOriginId: number
  ) {
    const queryParams: Record<string, any> = {};

    const headers: Record<string, any> = {};

    for (const queryUrlParam of createEntityData.queryUrlParams) {
      queryParams[queryUrlParam.key] = queryUrlParam.value;
    }

    for (const header of createEntityData.headers) {
      headers[header.key] = header.value;
    }

    const restHttpConfig: AxiosRequestConfig = {
      url: createEntityData.url,
      params: queryParams,
      headers: headers,
    };

    const insertBody: Record<string, any> = {
      entityDataOriginId: entityDataOriginId,
      primaryKey: createEntityData.primaryKey,
      restHttpConfig,
      getOneJsonPath: createEntityData.getOneJsonPath,
      errorJsonPath: createEntityData.errorJsonPath,
    };

    if (createEntityData.query_url) {
      insertBody['queryUrl'] = createEntityData.query_url;
    }

    return this.http
      .post<PostEntityResult>(this.externalOriginApi, {
        inserts: [{ ...insertBody }],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            return this.createExternalPagination(
              createEntityData,
              res.content[0]
            );
          }
          return of(null);
        })
      );
  }

  updateExternalDataOrigin(
    externalDataOriginId: number,
    updateEntityData: UpdateEntityExternalDataOrigin
  ) {
    const queryParams: Record<string, any> = {};

    const headers: Record<string, any> = {};

    for (const queryUrlParam of updateEntityData.queryUrlParams) {
      queryParams[queryUrlParam.key] = queryUrlParam.value;
    }

    for (const header of updateEntityData.headers) {
      headers[header.key] = header.value;
    }

    const restHttpConfig: AxiosRequestConfig = {
      url: updateEntityData.url,
      params: queryParams,
      headers: headers,
    };

    return this.http
      .put(this.externalOriginApi + `/${externalDataOriginId}`, {
        primaryKey: updateEntityData.primaryKey,
        restHttpConfig: JSON.stringify(restHttpConfig),
        getOneJsonPath: updateEntityData.getOneJsonPath,
        errorJsonPath: updateEntityData.errorJsonPath,
        queryUrl: updateEntityData.queryUrl,
      })
      .pipe(first());
  }

  updateExternalDataOriginPagination(
    paginationId: number,
    updateEntityData: UpdateEntityExternalDataOrigin
  ) {
    return this.http
      .put(this.externalPaginationApi + `/${paginationId}`, {
        jsonPathToItems: updateEntityData.jsonPathToItems,
        jsonPathToTotalItems: updateEntityData.jsonPathToTotalItems,
        itemsPerPageField: updateEntityData.itemsPerPageField,
        pageIndexField: updateEntityData.pageIndexField,
        sendPaginationInfoIn: updateEntityData.sendPaginationInfoIn,
      })
      .pipe(first());
  }

  createExternalPagination(
    createEntityData: CreateEntityData,
    externalOriginId: number
  ) {
    return this.http
      .post(this.externalPaginationApi, {
        inserts: [
          {
            externalOriginId,
            jsonPathToItems: createEntityData.itemsJsonPath,
            jsonPathToTotalItems: createEntityData.totalItemsJsonPath,
            itemsPerPageField: createEntityData.itemsPerPageField,
            pageIndexField: createEntityData.pageIndexField,
          },
        ],
      })
      .pipe(first());
  }

  createSubjectEntityRelationshipFromUpdate(
    entitySubjectsToCreate: {
      subjectId: number;
      entityId: number;
      crudExtension: string;
    }[]
  ) {
    const inserts: {
      subjectId: number;
      entityId: number;
      crudExtension: string;
    }[] = [];

    for (const toCreate of entitySubjectsToCreate) {
      inserts.push({
        subjectId: toCreate.subjectId,
        entityId: toCreate.entityId,
        crudExtension: toCreate.crudExtension,
      });
    }

    return this.http
      .post(this.subjectEntityApi, {
        inserts,
      })
      .pipe(first());
  }

  updateEntitySubjectRelationship(entitySubjectsToUpdate: {
    subjectEntityId: number;
    crudExtension: string;
  }) {
    return this.http
      .put(
        this.subjectEntityApi + `/${entitySubjectsToUpdate.subjectEntityId}`,
        {
          crudExtension: entitySubjectsToUpdate.crudExtension,
        }
      )
      .pipe(first());
  }

  deleteEntitySubjectRelationship(entitySubjectId: number) {
    return this.http
      .delete(this.subjectEntityApi + `/${entitySubjectId}`)
      .pipe(first());
  }

  createSubjectEntityRelationship(
    subjectsCrud: {
      subject: Subject;
      crudExtension: string;
    }[],
    entityId: number
  ) {
    const inserts: {
      subjectId: number;
      entityId: number;
      crudExtension: string;
    }[] = [];

    for (const sc of subjectsCrud) {
      inserts.push({
        subjectId: sc.subject.id as number,
        entityId,
        crudExtension: sc.crudExtension,
      });
    }

    return this.http
      .post(this.subjectEntityApi, {
        inserts,
      })
      .pipe(first());
  }

  getEntitySubjects(entityId: number) {
    return this.http
      .post<GetEntitySubject>(
        this.subjectEntityApi + '/query?pagination=false',
        {
          filters: [
            {
              column: 'entityId',
              value: entityId,
              operation: '=',
              negate: false,
              operator: 'and',
            },
          ],
        }
      )
      .pipe(first());
  }
}

interface GetDataOriginFromEntity {
  code: number;
  message: string;
  content: { type: string; entityId: number; id: number }[];
}

interface GetEntitySubject {
  code: number;
  message: string;
  content: EntitySubjects[];
}

export interface EntitySubjects {
  id: number;
  subjectId: number;
  entityId: number;
  crudExtension: string;
}

interface GetExternalDataOriginFromDataOrigin {
  code: number;
  message: string;
  content: {
    id: number;
    entityDataOriginId: number;
    primaryKey: string;
    restHttpConfig: AxiosRequestConfig;
    getOneJsonPath: string;
    errorJsonPath: string;
    queryUrl?: string;
  }[];
}

interface GetPaginationFromExternalDataOrigin {
  code: number;
  message: string;
  content: {
    id: number;
    externalOriginId: number;
    jsonPathToItems: string;
    jsonPathToTotalItems: string;
    itemsPerPageField: string;
    pageIndexField: string;
    sendPaginationInfoIn: string;
  }[];
}

export interface CreateEntityData {
  name: string;
  icon: string;
  data_origin: string;
  url?: string;
  getOneJsonPath?: string;
  errorJsonPath?: string;
  itemsJsonPath?: string;
  totalItemsJsonPath?: string;
  sendPaginationInfoIn?: string;
  pageIndexField?: string;
  itemsPerPageField?: string;
  headers: { key: string; value: string }[];
  queryUrlParams: { key: string; value: string }[];
  subjects_crud: { subject: Subject; crudExtension: string }[];
  use_query_endpoint?: boolean;
  query_url?: string;
  primaryKey?: string;
}

export interface UpdateEntityExternalDataOrigin {
  url: string;
  primaryKey: string;
  getOneJsonPath: string;
  errorJsonPath: string;
  jsonPathToItems: string;
  sendPaginationInfoIn: string;
  pageIndexField: string;
  itemsPerPageField: string;
  headers: { key: string; value: string }[];
  queryUrlParams: { key: string; value: string }[];
  jsonPathToTotalItems: string;
  queryUrl?: string;
}
export interface Entity {
  id?: number;
  name: string;
  icon: string;
  applicationId?: number;
  disableExcelExport?: boolean;
  disableReport?: boolean;
  useSteps?: number;
  viewListType?: string;
}

interface PostEntityResult {
  message: string;
  code: number;
  content?: number[];
}

interface GetEntitiesResult {
  message: string;
  code: number;
  content: {
    items?: Entity[];
    pageIndex: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface DataOrigin {
  type: string;
  externalOrigin?: {
    primaryKey: string;
    jsonPath: string;
    restHttpConfig: AxiosRequestConfig;
    oauth2HttpConfig?: AxiosRequestConfig;
    queryHttpConfig?: AxiosRequestConfig;
  };
}

interface GetOneEntityResult {
  message: string;
  code: number;
  content: Entity;
}

interface TableCreationColumn {
  type: string;
  length?: number;
  isNotNullable?: boolean;
  isUnique?: boolean;
  isUnsigned?: boolean;
  comment?: string;
  defaultValue?: number | string;
  reference?: Reference;
}

interface Reference {
  table: string;
  column: string;
}
