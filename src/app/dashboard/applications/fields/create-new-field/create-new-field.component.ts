import { FieldsService } from './../fields.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Entity, EntityService } from '../../entities/entity.service';
import { FormFieldDataRaw } from '../fields.service';

@Component({
  selector: 'app-create-new-field',
  templateUrl: './create-new-field.component.html',
  styleUrls: ['./create-new-field.component.scss'],
})
export class CreateNewFieldComponent implements OnInit, OnDestroy {
  applicationId: number;
  entityId: number;
  errorMessage!: string | undefined;
  entity!: Entity;
  createFieldForm: FormGroup;
  creating = false;
  useForeignRelation$: Subscription;
  usePossibleValuesFromDatabase$: Subscription;
  relationShipType$: Subscription;
  possibleValuesFormArray: FormArray;

  yesNo = [
    { value: 0, showValue: 'No' },
    { value: 1, showValue: 'Yes' },
  ];

  relationshipTypes = [
    { value: 'one-to-one', showValue: 'one-to-one' },
    { value: 'one-to-many', showValue: 'one-to-many' },
    { value: 'many-to-many', showValue: 'many-to-many' },
  ];

  inputTypes = [
    { value: 'text', showValue: 'Text' },
    { value: 'textarea', showValue: 'Text Area' },
    { value: 'select', showValue: 'Select' },
    { value: 'datepicker', showValue: 'Datepicker' },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
    private formBuilder: FormBuilder,
    private fieldService: FieldsService
  ) {
    const params = this.activatedRoute.snapshot.params as {
      applicationId: string;
      entityId: string;
    };
    this.applicationId = parseInt(params.applicationId);
    this.entityId = parseInt(params.entityId);

    this.createFieldForm = this.formBuilder.group({
      name: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      variableType: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      comment: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(155),
        ])
      ),
      variableLength: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([Validators.minLength(2), Validators.maxLength(45)])
      ),
      defaultValue: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([Validators.minLength(1), Validators.maxLength(155)])
      ),
      isNullable: this.formBuilder.control({
        value: this.yesNo[1].value,
        disabled: false,
      }),
      isPrimaryKey: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: false,
      }),
      isUnsigned: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: false,
      }),
      isUnique: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: false,
      }),
      visibleOnList: this.formBuilder.control({
        value: this.yesNo[1].value,
        disabled: false,
      }),
      alias: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/ ]+$/),
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      stereoTypeOnList: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      operations: this.formBuilder.control(
        {
          value: 'all',
          disabled: false,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-z::=><]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      defaultValueForFilter: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([Validators.minLength(2), Validators.maxLength(145)])
      ),
      editable: this.formBuilder.control({
        value: this.yesNo[1].value,
        disabled: false,
      }),
      disabledFilter: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: false,
      }),
      useForeignRelation: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: false,
      }),
      foreignTableName: this.formBuilder.control(
        {
          value: '',
          disabled: true,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(75),
        ])
      ),
      foreignFieldToShow: this.formBuilder.control(
        {
          value: '',
          disabled: true,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      foreignPrimaryKey: this.formBuilder.control(
        {
          value: '',
          disabled: true,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      intermediateTable: this.formBuilder.control(
        {
          value: '',
          disabled: true,
        },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      showForeignForm: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: true,
      }),
      intermediatePrimaryKey: this.formBuilder.control(
        {
          value: '',
          disabled: true,
        },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      relationshipType: this.formBuilder.control(
        {
          value: this.relationshipTypes[0].value,
          disabled: true,
        },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      label: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/ ]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      usePossibleValuesFromDatabase: this.formBuilder.control({
        value: this.yesNo[1].value,
        disabled: false,
      }),
      disabledInInput: this.formBuilder.control({
        value: this.yesNo[0].value,
        disabled: false,
      }),
      validatorsConfiguration: this.formBuilder.control(
        { value: '{}', disabled: false },
        Validators.compose([Validators.required, this.jsonParseValidator])
      ),
      advancedConfiguration: this.formBuilder.control(
        { value: '{}', disabled: false },
        Validators.compose([Validators.required, this.jsonParseValidator])
      ),
      tooltip: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/ ]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      stereoTypeOnInput: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(45),
        ])
      ),
      onCreate: this.formBuilder.control({
        value: this.yesNo[1].value,
        disabled: false,
      }),
      defaultValueOnInput: this.formBuilder.control(
        {
          value: '',
          disabled: false,
        },
        Validators.compose([Validators.minLength(2), Validators.maxLength(150)])
      ),
      editableOnInput: this.formBuilder.control({
        value: this.yesNo[1].value,
        disabled: false,
      }),
      typeOnInput: this.formBuilder.control({
        value: this.inputTypes[0].value,
        disabled: false,
      }),
      possibleValues: this.formBuilder.array([]),
    });

    this.possibleValuesFormArray = this.createFieldForm.get(
      'possibleValues'
    ) as FormArray;

    this.addPossibleValue(true);

    this.usePossibleValuesFromDatabase$ = this.createFieldForm
      .get('usePossibleValuesFromDatabase')
      ?.valueChanges.subscribe((value: number) => {
        for (const control of this.possibleValuesFormArray.controls) {
          if (value === 1) {
            control.get('value')?.disable();
            control.get('displayValue')?.disable();
          } else {
            control.get('value')?.enable();
            control.get('displayValue')?.enable();
          }
        }
      }) as Subscription;

    this.useForeignRelation$ = this.createFieldForm
      .get('useForeignRelation')
      ?.valueChanges.subscribe((value) => {
        if (value === 1) {
          this.createFieldForm.get('relationshipType')?.enable();
          this.createFieldForm.get('foreignTableName')?.enable();
          this.createFieldForm.get('foreignFieldToShow')?.enable();
          this.createFieldForm.get('foreignPrimaryKey')?.enable();
          this.createFieldForm.get('showForeignForm')?.enable();
        } else {
          this.createFieldForm.get('relationshipType')?.disable();
          this.createFieldForm.get('foreignTableName')?.disable();
          this.createFieldForm.get('foreignFieldToShow')?.disable();
          this.createFieldForm.get('foreignPrimaryKey')?.disable();
          this.createFieldForm.get('showForeignForm')?.disable();
          this.createFieldForm.get('intermediateTable')?.disable();
          this.createFieldForm.get('intermediatePrimaryKey')?.disable();
        }
      }) as Subscription;

    this.relationShipType$ = this.createFieldForm
      .get('relationshipType')
      ?.valueChanges.subscribe((value) => {
        if (value === 'many-to-many') {
          this.createFieldForm.get('intermediateTable')?.enable();
          this.createFieldForm.get('intermediatePrimaryKey')?.enable();
        } else {
          this.createFieldForm.get('intermediateTable')?.disable();
          this.createFieldForm.get('intermediatePrimaryKey')?.disable();
        }
      }) as Subscription;

    this.entityService.getEntity(this.entityId).subscribe({
      error: (err) => {
        if (err.error) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Unknown Error';
        }
      },
      next: (res) => {
        this.entity = res.content;
      },
    });
  }
  ngOnDestroy(): void {
    this.relationShipType$?.unsubscribe();
    this.useForeignRelation$?.unsubscribe();
    this.usePossibleValuesFromDatabase$?.unsubscribe();
  }

  jsonParseValidator(control: AbstractControl) {
    try {
      JSON.parse(control.value);
    } catch (error: any) {
      return { jsonInvalid: error.message };
    }
    return null;
  }

  tapKeyPressedInTextarea(
    keyEvent: KeyboardEvent,
    rawBodyTextArea: HTMLTextAreaElement
  ) {
    if (keyEvent.key === 'Tab') {
      const startPost = rawBodyTextArea.selectionStart;
      keyEvent.preventDefault();
      const rawBodyRef = this.createFieldForm.get('validatorsConfiguration');
      const originalValue = rawBodyRef?.value as string;

      rawBodyRef?.setValue(
        originalValue.substring(0, startPost) +
          '   ' +
          originalValue.substring(startPost)
      );

      rawBodyTextArea.selectionStart = rawBodyTextArea.selectionEnd =
        startPost + 3;
    }
  }

  getErrorMessage(formControlName: string) {
    if (this.createFieldForm.get(formControlName)?.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.createFieldForm.get(formControlName)?.hasError('jsonInvalid')) {
      return this.createFieldForm.get(formControlName)?.getError('jsonInvalid');
    }

    return this.createFieldForm.get(formControlName)?.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  ngOnInit(): void {}

  addPossibleValue(setInvalid = false) {
    const baseFormGroup = this.formBuilder.group({
      value: this.formBuilder.control(
        { value: '', disabled: setInvalid },
        Validators.compose([Validators.required])
      ),
      displayValue: this.formBuilder.control(
        { value: '', disabled: setInvalid },
        Validators.compose([Validators.required])
      ),
    });
    this.possibleValuesFormArray.push(baseFormGroup);
  }

  removePossibleValue(groupIndex: number) {
    this.possibleValuesFormArray.removeAt(groupIndex);
  }

  disablePostCreate() {
    if (
      this.createFieldForm.get('usePossibleValuesFromDatabase')?.value === 1
    ) {
      for (const control of this.possibleValuesFormArray.controls) {
        control.get('value')?.disable();
        control.get('displayValue')?.disable();
      }
    }

    if (this.createFieldForm.get('useForeignRelation')?.value === 1) {
      this.createFieldForm.get('value')?.disable();
      this.createFieldForm.get('displayValue')?.disable();
      if (
        this.createFieldForm.get('relationshipType')?.value !== 'many-to-many'
      ) {
        this.createFieldForm.get('value')?.disable();
        this.createFieldForm.get('displayValue')?.disable();
      }
    }
  }

  createField(formData: FormFieldDataRaw) {
    this.creating = true;
    this.createFieldForm.disable();
    this.fieldService
      .createDataBaseOrigin(formData, this.entity.id as number)
      .subscribe({
        error: (err) => {
          this.creating = false;
          this.createFieldForm.enable();
          if (err.error) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Unknown Error';
          }
        },
        next: (res: any) => {
          this.creating = false;
          if (res.dataListConfig && res.dataInputConfig) {
            this.router.navigate([
              `/dashboard/application/${this.applicationId}/entity/${this.entityId}/fields`,
            ]);
          } else {
            this.createFieldForm.enable();
            this.errorMessage = 'Unknown Error.';
          }
        },
      });
  }
}
