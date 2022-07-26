import { DataOrigin, Entity } from './../entities/entity.service';
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

  rawApi = environment.api + '/api/zero-code/raw-query';

  constructor(private http: HttpClient) {}

  // createField(createFieldData: FormFieldDataRaw, entityId: number) {
  //   return this.http.post(this.fieldApi, )
  // }

  createDataBaseOrigin(createFieldData: FormFieldDataRaw, entity: Entity) {
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
                entity,
                res.content[0]
              );
            }
            return this.createField(createFieldData, entity, res.content[0]);
          }
          return of(null);
        })
      );
  }

  createForeignRelationShip(
    createFieldData: FormFieldDataRaw,
    entity: Entity,
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
              entity,
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
    entity: Entity,
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
            return this.createField(createFieldData, entity, dataOriginId);
          }
          return of(null);
        })
      );
  }

  createField(
    createFieldData: FormFieldDataRaw,
    entity: Entity,
    dataOriginId: number
  ) {
    return this.http
      .post<PostCreateResult>(this.fieldApi, {
        inserts: [
          {
            entityId: entity.id as number,
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
            }).pipe(first());
          }
          return of(null);
        }),
        mergeMap((res) => {
          console.log(res);
          let variableLength = '';
          if ((createFieldData.variableLength as any as string) !== '') {
            variableLength = `(${createFieldData.variableLength})`;
          }
          let notNull = '';
          if (!createFieldData.isNullable) {
            notNull = 'NOT NULL';
          }
          let unique = '';
          if (createFieldData.isUnique) {
            unique = 'UNIQUE';
          }
          let unsigned = '';
          if (createFieldData.isUnsigned) {
            unsigned = 'UNSIGNED';
          }
          let foreignQuery = '';
          if (createFieldData.useForeignRelation) {
            foreignQuery = `ADD CONSTRAINT FK_${entity.name}_${createFieldData.foreignTableName}
            ADD FOREIGN KEY (${createFieldData.name}) REFERENCES ${createFieldData.foreignTableName}(${createFieldData.foreignPrimaryKey})`;
          }
          let defaultValue = '';
          if (createFieldData.defaultValue !== '') {
            defaultValue = `DEFAULT '${createFieldData.defaultValue}'`;
          }
          let comment = '';
          if (createFieldData.comment !== '') {
            comment = `COMMENT '${createFieldData.comment}'`;
          }
          return this.executeRawQuery(
            `ALTER TABLE ${entity.name} ADD COLUMN ${createFieldData.name} ${createFieldData.variableType}${variableLength} ${unique} ${notNull} ${unsigned} ${defaultValue} ${comment} ${foreignQuery};`
          );
        })
      );
  }

  executeRawQuery(dbQuery: string) {
    return this.http.post(this.rawApi, { dbQuery }).pipe(first());
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
