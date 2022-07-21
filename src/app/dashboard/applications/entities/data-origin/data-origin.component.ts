import {
  EntityService,
  UpdateEntityExternalDataOrigin,
} from './../entity.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Entity } from '../entity.service';
import { AxiosRequestConfig } from 'axios';
import { forkJoin, first } from 'rxjs';

@Component({
  selector: 'app-data-origin',
  templateUrl: './data-origin.component.html',
  styleUrls: ['./data-origin.component.scss'],
})
export class DataOriginComponent implements OnInit {
  headersFormArray!: FormArray;
  queryUrlFormArray!: FormArray;
  dataOriginForm!: FormGroup;
  creating = false;
  errorMessage!: string;
  dataOrigins = [
    { value: 'local', showValue: 'Local' },
    { value: 'external', showValue: 'External' },
  ];
  paginationInfoInOptions = [
    { value: 'headers', showValue: 'Headers' },
    { value: 'query', showValue: 'Query url' },
    { value: 'body', showValue: 'Body' },
  ];

  dataOrigin!: DataOriginLocal | DataOriginExternal;

  startDatOriginType!: string;

  constructor(
    public dialogRef: MatDialogRef<DataOriginComponent>,
    @Inject(MAT_DIALOG_DATA) public entity: Entity,
    private formBuilder: FormBuilder,
    private entityService: EntityService
  ) {
    this.entityService
      .getDataOriginFromEntity(this.entity.id as number)
      .subscribe({
        error: (err) => {
          this.dialogRef.disableClose = false;
          if (err.error) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Unknown Error';
          }
        },
        next: (res) => {
          if (res) {
            this.dataOrigin = res as DataOriginLocal | DataOriginExternal;
            this.startDatOriginType = this.dataOrigin.type;
            this.initForm();
          }
        },
      });
  }

  initForm() {
    const isExternalDatOrigin = this.dataOrigin.type === 'external';

    const externalFormData: Record<string, any> = {};

    if (isExternalDatOrigin) {
      const externalDataOrigin = this.dataOrigin as DataOriginExternal;

      externalFormData['url'] = this.formBuilder.control(
        {
          value: externalDataOrigin.externalDataOrigin.restHttpConfig.url,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.minLength(2)])
      );

      externalFormData['primaryKey'] = this.formBuilder.control(
        {
          value: externalDataOrigin.externalDataOrigin.primaryKey,
          disabled: false,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.maxLength(40),
        ])
      );

      externalFormData['getOneJsonPath'] = this.formBuilder.control(
        {
          value: externalDataOrigin.externalDataOrigin.getOneJsonPath,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.minLength(2)])
      );

      externalFormData['errorJsonPath'] = this.formBuilder.control(
        {
          value: externalDataOrigin.externalDataOrigin.errorJsonPath,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.minLength(2)])
      );

      externalFormData['jsonPathToItems'] = this.formBuilder.control(
        {
          value:
            externalDataOrigin.externalDataOrigin.pagination.jsonPathToItems,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.minLength(2)])
      );

      externalFormData['jsonPathToTotalItems'] = this.formBuilder.control(
        {
          value:
            externalDataOrigin.externalDataOrigin.pagination
              .jsonPathToTotalItems,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.minLength(2)])
      );

      externalFormData['sendPaginationInfoIn'] = this.formBuilder.control(
        {
          value:
            externalDataOrigin.externalDataOrigin.pagination
              .sendPaginationInfoIn,
          disabled: false,
        },
        Validators.compose([Validators.required])
      );

      externalFormData['pageIndexField'] = this.formBuilder.control(
        {
          value:
            externalDataOrigin.externalDataOrigin.pagination.pageIndexField,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.maxLength(55)])
      );

      externalFormData['itemsPerPageField'] = this.formBuilder.control(
        {
          value:
            externalDataOrigin.externalDataOrigin.pagination.itemsPerPageField,
          disabled: false,
        },
        Validators.compose([Validators.required, Validators.maxLength(55)])
      );

      externalFormData['queryUrl'] = this.formBuilder.control(
        {
          value: externalDataOrigin.externalDataOrigin.queryUrl || '',
          disabled: false,
        },
        Validators.compose([Validators.maxLength(155)])
      );

      externalFormData['headers'] = this.formBuilder.array([]);

      externalFormData['queryUrlParams'] = this.formBuilder.array([]);
    }

    this.dataOriginForm = this.formBuilder.group({
      type: this.formBuilder.control({
        value: this.dataOrigin.type,
        disabled: true,
      }),
      ...externalFormData,
    });

    if (isExternalDatOrigin) {
      const externalDataOrigin = this.dataOrigin as DataOriginExternal;

      this.headersFormArray = this.dataOriginForm.get('headers') as FormArray;

      this.queryUrlFormArray = this.dataOriginForm.get(
        'queryUrlParams'
      ) as FormArray;

      const currentHeaders =
        externalDataOrigin.externalDataOrigin.restHttpConfig.headers || {};

      const currentUrlQueryParams =
        externalDataOrigin.externalDataOrigin.restHttpConfig.params || {};

      for (const headerKey in currentHeaders) {
        this.addHeaderPair(headerKey, currentHeaders[headerKey] as string);
      }

      for (const urlQueryHeadersKey in currentUrlQueryParams) {
        this.addHeaderPair(
          urlQueryHeadersKey,
          currentUrlQueryParams[urlQueryHeadersKey] as string
        );
      }
    }
  }

  updateEntityExternalDataOrigin(
    updateEntityData: UpdateEntityExternalDataOrigin
  ) {
    this.dataOriginForm.disable();

    this.creating = true;

    forkJoin({
      externalDataOriginUpdateResult:
        this.entityService.updateExternalDataOrigin(
          (this.dataOrigin as DataOriginExternal).externalDataOrigin.id,
          updateEntityData
        ),
      paginationUpdateResult:
        this.entityService.updateExternalDataOriginPagination(
          (this.dataOrigin as DataOriginExternal).externalDataOrigin.pagination
            .id,
          updateEntityData
        ),
    })
      .pipe(first())
      .subscribe({
        error: (err) => {
          this.creating = false;
          this.dataOriginForm.enable();
          this.dataOriginForm.get('type')?.disable();
          if (err.error) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Unknown Error';
          }
        },
        next: (res: any) => {
          this.creating = false;
          if (
            res.externalDataOriginUpdateResult &&
            res.paginationUpdateResult
          ) {
            this.dialogRef.close(true);
          } else {
            this.dataOriginForm.enable();
            this.dataOriginForm.get('type')?.disable();
            this.errorMessage = 'Unknown Error.';
          }
        },
      });
  }

  removeHeaderPair(groupIndex: number): void {
    this.headersFormArray.removeAt(groupIndex);
  }

  removeUrlQueryParamPair(groupIndex: number): void {
    this.queryUrlFormArray.removeAt(groupIndex);
  }

  addHeaderPair(defaultKey?: string, defaultValue?: string): void {
    const baseFormGroup = this.formBuilder.group({
      key: this.formBuilder.control(
        defaultKey || '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(75),
        ])
      ),
      value: this.formBuilder.control(
        defaultValue || '',
        Validators.compose([Validators.required])
      ),
    });
    this.headersFormArray.push(baseFormGroup);
  }

  addUrlQueryParamPair(defaultKey?: string, defaultValue?: string): void {
    const baseFormGroup = this.formBuilder.group({
      key: this.formBuilder.control(
        defaultKey || '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(75),
        ])
      ),
      value: this.formBuilder.control(
        defaultValue || '',
        Validators.compose([Validators.required])
      ),
    });
    this.queryUrlFormArray.push(baseFormGroup);
  }

  getErrorMessage(formControlName: string) {
    if (this.dataOriginForm.get(formControlName)?.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.dataOriginForm.get(formControlName)?.hasError('jsonInvalid')) {
      return this.dataOriginForm.get(formControlName)?.getError('jsonInvalid');
    }

    return this.dataOriginForm.get(formControlName)?.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnInit(): void {}
}

interface DataOriginLocal {
  type: string;
  id: number;
}

interface DataOriginExternal {
  id: number;
  type: string;
  externalDataOrigin: {
    id: number;
    errorJsonPath: string;
    getOneJsonPath: string;
    primaryKey: string;
    queryUrl?: string;
    restHttpConfig: AxiosRequestConfig;
    pagination: {
      id: number;
      externalOriginId: string;
      itemsPerPageField: string;
      jsonPathToItems: string;
      jsonPathToTotalItems: string;
      pageIndexField: string;
      sendPaginationInfoIn: string;
    };
  };
}
