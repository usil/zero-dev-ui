import { DataOrigin } from './../entities/entity.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, first, mergeMap, of, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FieldsService {
  fieldApi = environment.api + '/api/field';
  dataBaseOriginApi = environment.api + '/api/data_base_origin';
  foreignDataBaseOriginApi = environment.api + '/api/foreign_relation';
  fieldListConfigurationApi =
    environment.api + '/api/fields_list_configuration';
  fieldInputConfigurationApi =
    environment.api + '/api/field_input_configuration';

  filterConfigurationApi = environment.api + '/api/filter_configuration';

  possibleValuesApi = environment.api + '/api/possible_value';

  constructor(private http: HttpClient) {}

  // createField(createFieldData: FormFieldDataRaw, entityId: number) {
  //   return this.http.post(this.fieldApi, )
  // }

  createDataBaseOrigin(createFieldData: FormFieldDataRaw, entityId: number) {
    return this.http
      .post<PostCreateResult>(this.dataBaseOriginApi, {
        inserts: [
          {
            variableType: createFieldData.variableType,
            isNullable: createFieldData.isNullable,
            isPrimaryKey: createFieldData.isPrimaryKey,
            isUnsigned: createFieldData.isUnsigned,
            isUnique: createFieldData.isUnique,
            comment:
              createFieldData.comment !== '' ? createFieldData.comment : null,
            defaultValue:
              createFieldData.defaultValue !== ''
                ? createFieldData.defaultValue
                : null,
            variableLength: createFieldData.variableLength,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            if (createFieldData.useForeignRelation) {
              return this.createForeignRelationShip(
                createFieldData,
                entityId,
                res.content[0]
              );
            }
            return this.createField(createFieldData, entityId, res.content[0]);
          }
          return of(null);
        })
      );
  }

  createForeignRelationShip(
    createFieldData: FormFieldDataRaw,
    entityId: number,
    dataOriginId: number
  ) {
    return this.http
      .post<PostCreateResult>(this.foreignDataBaseOriginApi, {
        inserts: [
          {
            foreignTableName: createFieldData.foreignTableName,
            foreignFieldToShow: createFieldData.foreignFieldToShow,
            foreignPrimaryKey: createFieldData.foreignPrimaryKey,
            intermediateTable: createFieldData.intermediateTable,
            showForeignForm: createFieldData.showForeignForm,
            intermediatePrimaryKey: createFieldData.intermediatePrimaryKey,
            relationshipType: createFieldData.relationshipType,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            return this.updateDatabaseOrigin(
              createFieldData,
              entityId,
              dataOriginId,
              res.content[0]
            );
          }
          return of(null);
        })
      );
  }

  updateDatabaseOrigin(
    createFieldData: FormFieldDataRaw,
    entityId: number,
    dataOriginId: number,
    foreignRelationId: number
  ) {
    return this.http
      .put(this.dataBaseOriginApi + `/${dataOriginId}?identifierColumn=id`, {
        foreignRelationId: foreignRelationId,
      })
      .pipe(
        first(),
        mergeMap((res: any) => {
          if (res.content) {
            return this.createField(createFieldData, entityId, dataOriginId);
          }
          return of(null);
        })
      );
  }

  createField(
    createFieldData: FormFieldDataRaw,
    entityId: number,
    dataOriginId: number
  ) {
    return this.http
      .post<PostCreateResult>(this.fieldApi, {
        inserts: [
          {
            entityId,
            dataBaseOriginId: dataOriginId,
            name: createFieldData.name,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            return forkJoin({
              dataListConfig: this.createFieldListConfiguration(
                createFieldData,
                res.content[0]
              ),
              dataInputConfig: this.createFieldVisualConfiguration(
                createFieldData,
                res.content[0]
              ),
            });
          }
          return of(null);
        })
      );
  }

  createFieldListConfiguration(
    createFieldData: FormFieldDataRaw,
    fieldId: number
  ) {
    return this.http
      .post<PostCreateResult>(this.fieldListConfigurationApi, {
        inserts: [
          {
            fieldId,
            visible: createFieldData.visibleOnList,
            alias: createFieldData.alias,
            stereotype: createFieldData.stereoTypeOnList,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            return this.createFilterConfiguration(
              createFieldData,
              res.content[0]
            );
          }
          return of(null);
        })
      );
  }

  createFilterConfiguration(
    createFieldData: FormFieldDataRaw,
    fieldsListConfigurationId: number
  ) {
    return this.http
      .post(this.filterConfigurationApi, {
        inserts: [
          {
            fieldsListConfigurationId,
            operations: createFieldData.operations,
            defaultValue:
              createFieldData.defaultValue !== ''
                ? createFieldData.defaultValue
                : null,
            editable: createFieldData.editable,
            disabled: createFieldData.disabledFilter,
          },
        ],
      })
      .pipe(first());
  }

  createPossiblesValues(
    createFieldData: FormFieldDataRaw,
    fieldInputConfigurationId: number
  ) {
    const inserts: {
      fieldInputConfigurationId: number;
      value: string;
      displayValue: string;
    }[] = [];

    for (const possibleValue of createFieldData.possibleValues) {
      inserts.push({
        fieldInputConfigurationId,
        value: possibleValue.value,
        displayValue: possibleValue.displayValue,
      });
    }

    return this.http
      .post(this.possibleValuesApi, {
        inserts,
      })
      .pipe(first());
  }

  createFieldVisualConfiguration(
    createFieldData: FormFieldDataRaw,
    fieldId: number
  ) {
    return this.http
      .post<PostCreateResult>(this.fieldInputConfigurationApi, {
        inserts: [
          {
            fieldId,
            label: createFieldData.label,
            usePossibleValuesFromDatabase:
              createFieldData.usePossibleValuesFromDatabase,
            disabled: createFieldData.disabledInInput,
            advancedConfiguration: createFieldData.advancedConfiguration,
            cssConfiguration: '{}',
            validatorsConfiguration: createFieldData.validatorsConfiguration,
            tooltip: createFieldData.tooltip,
            stereotype: createFieldData.stereoTypeOnInput,
            onCreate: createFieldData.onCreate,
            useInnerForm: null,
            defaultValue: createFieldData.defaultValueOnInput,
            type: createFieldData.typeOnInput,
            editable: createFieldData.editable,
          },
        ],
      })
      .pipe(
        first(),
        mergeMap((res) => {
          if (res.content && res.content.length === 1) {
            if (!createFieldData.usePossibleValuesFromDatabase) {
              return this.createPossiblesValues(
                createFieldData,
                res.content[0]
              );
            }
            return of(res);
          }
          return of(null);
        })
      );
  }

  getFields(
    orderType: string,
    pageIndex: number,
    sortBy: string,
    itemsPerPage: number,
    entityId: number
  ): Observable<GetFieldsResult> {
    return this.http
      .post<GetFieldsResult>(this.fieldApi + '/query', {
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

interface PostCreateResult {
  message: string;
  code: number;
  content?: number[];
}

export interface FormFieldDataRaw {
  advancedConfiguration: string;
  alias: string;
  comment: string;
  defaultValue: string;
  defaultValueForFilter: string;
  defaultValueOnInput: string;
  disabledFilter: boolean;
  disabledInInput: boolean;
  editable: boolean;
  editableOnInput: boolean;
  foreignFieldToShow: string;
  foreignPrimaryKey: string;
  foreignTableName: string;
  intermediatePrimaryKey: string;
  intermediateTable: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isUnsigned: boolean;
  label: string;
  name: string;
  onCreate: boolean;
  operations: string;
  relationshipType: string;
  showForeignForm: boolean;
  stereoTypeOnInput: string;
  stereoTypeOnList: string;
  tooltip: string;
  useForeignRelation: boolean;
  usePossibleValuesFromDatabase: boolean;
  validatorsConfiguration: string;
  variableLength: number;
  variableType: string;
  visibleOnList: boolean;
  typeOnInput: string;
  possibleValues: { value: string; displayValue: string }[];
}
