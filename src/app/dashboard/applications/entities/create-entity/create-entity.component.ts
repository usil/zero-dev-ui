import { Subject, SubjectService } from './../../../subjects/subject.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationsService, Application } from '../../applications.service';
import { CreateEntityData, EntityService } from '../entity.service';
import { distinctUntilChanged, startWith, Subscription } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
@Component({
  selector: 'app-create-entity',
  templateUrl: './create-entity.component.html',
  styleUrls: ['./create-entity.component.scss'],
})
export class CreateEntityComponent {
  createEntityForm: FormGroup;
  headersFormArray: FormArray;
  queryUrlFormArray: FormArray;

  creating = false;

  subjectsCrudFormArray: FormArray;

  applicationId: number;
  errorMessage!: string | undefined;
  application!: Application;

  currentSubjects: Subject[] = [];
  subjects: Subject[] = [];
  // filteredSubjects: Observable<Subject[]>;

  // @ViewChild('subjectInput') subjectInput!: ElementRef<HTMLInputElement>;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  dataOptionsSubscription: Subscription;

  dataOrigins = [
    { value: 'local', showValue: 'Local' },
    { value: 'external', showValue: 'External' },
  ];

  paginationInfoInOptions = [
    { value: 'headers', showValue: 'Headers' },
    { value: 'query', showValue: 'Query url' },
    { value: 'body', showValue: 'Body' },
  ];

  currentDataOrigin = 'local';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationsService,
    private entityService: EntityService,
    private formBuilder: FormBuilder,
    private subjectService: SubjectService
  ) {
    const params = this.activatedRoute.snapshot.params as { id: string };
    this.applicationId = parseInt(params.id);

    this.createEntityForm = this.formBuilder.group({
      name: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(40),
        ])
      ),
      icon: this.formBuilder.control(
        { value: '', disabled: false },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(40),
        ])
      ),
      primaryKey: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.maxLength(40),
        ])
      ),
      data_origin: this.formBuilder.control(
        { value: 'local', disabled: false },
        Validators.compose([Validators.required])
      ),
      url: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      getOneJsonPath: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      errorJsonPath: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      itemsJsonPath: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      totalItemsJsonPath: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      sendPaginationInfoIn: this.formBuilder.control(
        { value: 'headers', disabled: true },
        Validators.compose([Validators.required])
      ),
      pageIndexField: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.maxLength(55)])
      ),
      itemsPerPageField: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.maxLength(55)])
      ),
      headers: this.formBuilder.array([]),
      queryUrlParams: this.formBuilder.array([]),
      use_query_endpoint: this.formBuilder.control(
        { value: false, disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      query_url: this.formBuilder.control(
        { value: '', disabled: true },
        Validators.compose([Validators.required, Validators.minLength(2)])
      ),
      subjects_crud: this.formBuilder.array([]),
    });

    this.headersFormArray = this.createEntityForm.get('headers') as FormArray;
    this.queryUrlFormArray = this.createEntityForm.get(
      'queryUrlParams'
    ) as FormArray;

    this.subjectsCrudFormArray = this.createEntityForm.get(
      'subjects_crud'
    ) as FormArray;

    this.addSubjectCrud();

    this.createEntityForm
      .get('use_query_endpoint')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value: boolean) => {
        if (value) {
          this.createEntityForm.get('query_url')?.enable();
        } else {
          this.createEntityForm.get('query_url')?.disable();
        }
      });

    this.createEntityForm
      .get('data_origin')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value: 'external' | 'local') => {
        this.currentDataOrigin = value;
        this.headersFormArray.clear();
        this.queryUrlFormArray.clear();
        if (value === 'external') {
          this.createEntityForm.get('url')?.enable();
          this.createEntityForm.get('jsonPath')?.enable();
          this.createEntityForm.get('use_query_endpoint')?.enable();
          this.createEntityForm.get('use_query_endpoint')?.setValue(false);

          this.createEntityForm.get('getOneJsonPath')?.enable();
          this.createEntityForm.get('errorJsonPath')?.enable();
          this.createEntityForm.get('itemsJsonPath')?.enable();
          this.createEntityForm.get('totalItemsJsonPath')?.enable();
          this.createEntityForm.get('sendPaginationInfoIn')?.enable();
          this.createEntityForm.get('pageIndexField')?.enable();
          this.createEntityForm.get('itemsPerPageField')?.enable();
          this.createEntityForm.get('primaryKey')?.enable();
        } else {
          this.createEntityForm.get('url')?.disable();
          this.createEntityForm.get('jsonPath')?.disable();
          this.createEntityForm.get('use_query_endpoint')?.disable();

          this.createEntityForm.get('getOneJsonPath')?.disable();
          this.createEntityForm.get('errorJsonPath')?.disable();
          this.createEntityForm.get('itemsJsonPath')?.disable();
          this.createEntityForm.get('totalItemsJsonPath')?.disable();
          this.createEntityForm.get('sendPaginationInfoIn')?.disable();
          this.createEntityForm.get('pageIndexField')?.disable();
          this.createEntityForm.get('itemsPerPageField')?.disable();
          this.createEntityForm.get('primaryKey')?.disable();
        }
      });

    this.dataOptionsSubscription = this.applicationService
      .getApplication(this.applicationId)
      .subscribe({
        error: (err) => {
          if (err.error) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Unknown Error';
          }
        },
        next: (res) => {
          this.application = res.content;
        },
      });

    this.subjectService.getSubjects('asc', 0, 'id', 100000).subscribe({
      error: (err) => {
        if (err.error) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Unknown Error';
        }
      },
      next: (res) => {
        this.subjects = res.content.items as Subject[];
      },
    });
  }

  getErrorMessage(formControlName: string) {
    if (this.createEntityForm.get(formControlName)?.hasError('required')) {
      return 'You must enter a value';
    }

    if (this.createEntityForm.get(formControlName)?.hasError('jsonInvalid')) {
      return this.createEntityForm
        .get(formControlName)
        ?.getError('jsonInvalid');
    }

    return this.createEntityForm.get(formControlName)?.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  addHeaderPair(): void {
    const baseFormGroup = this.formBuilder.group({
      key: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(75),
        ])
      ),
      value: this.formBuilder.control(
        '',
        Validators.compose([Validators.required])
      ),
    });
    this.headersFormArray.push(baseFormGroup);
  }

  removeHeaderPair(groupIndex: number): void {
    this.headersFormArray.removeAt(groupIndex);
  }

  addSubjectCrud() {
    const baseFormGroup = this.formBuilder.group({
      subject: this.formBuilder.control(
        '',
        Validators.compose([Validators.required])
      ),
      crudExtension: this.formBuilder.control(
        'CRUD',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[CRUD]+$/),
        ])
      ),
    });

    this.subjectsCrudFormArray.push(baseFormGroup);
  }

  removeSubjectCrud(groupIndex: number): void {
    this.subjectsCrudFormArray.removeAt(groupIndex);
  }

  addUrlQueryParamPair(): void {
    const baseFormGroup = this.formBuilder.group({
      key: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(75),
        ])
      ),
      value: this.formBuilder.control(
        '',
        Validators.compose([Validators.required])
      ),
    });
    this.queryUrlFormArray.push(baseFormGroup);
  }

  removeUrlQueryParamPair(groupIndex: number): void {
    this.queryUrlFormArray.removeAt(groupIndex);
  }

  private _filter(value: string | Subject): Subject[] {
    let filterValue = '';

    if ((value as Subject).identifier === undefined) {
      filterValue = (value as string).toLowerCase();
    } else {
      filterValue = (value as Subject).identifier.toLowerCase();
    }

    return this.subjects.filter((subject) =>
      subject.identifier.toLowerCase().includes(filterValue)
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    const subject = this.subjects.find((s) => s.identifier === value);

    if (value && subject) {
      this.currentSubjects.push(subject);
    }

    event.chipInput!.clear();

    this.createEntityForm.get('subjects')?.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.currentSubjects.push(event.option.value);
    this.createEntityForm.get('subjects')?.setValue(null);
  }

  remove(subject: Subject): void {
    const index = this.currentSubjects.findIndex((cs) => cs.id === subject.id);

    if (index >= 0) {
      this.currentSubjects.splice(index, 1);
    }
  }

  enableAfterCreateError() {
    this.createEntityForm.get('name')?.enable();
    this.createEntityForm.get('icon')?.enable();
    this.createEntityForm.get('data_origin')?.enable();

    this.subjectsCrudFormArray.enable();

    if (this.createEntityForm.get('data_origin')?.value === 'external') {
      this.createEntityForm.get('use_query_endpoint')?.enable();
      if (this.createEntityForm.get('use_query_endpoint')?.value) {
        this.createEntityForm.get('query_url')?.enable();
      }
      this.createEntityForm.get('url')?.enable();
      this.createEntityForm.get('jsonPath')?.enable();
      this.createEntityForm.get('getOneJsonPath')?.enable();
      this.createEntityForm.get('errorJsonPath')?.enable();
      this.createEntityForm.get('itemsJsonPath')?.enable();
      this.createEntityForm.get('totalItemsJsonPath')?.enable();
      this.createEntityForm.get('sendPaginationInfoIn')?.enable();
      this.createEntityForm.get('pageIndexField')?.enable();
      this.createEntityForm.get('itemsPerPageField')?.enable();
      this.createEntityForm.get('primaryKey')?.enable();
    }
  }

  createEntity(createEntityData: CreateEntityData) {
    this.creating = true;
    this.createEntityForm.disable();
    this.entityService
      .createEntity(createEntityData, this.applicationId)
      .subscribe({
        error: (err) => {
          this.creating = false;

          this.enableAfterCreateError();

          if (err.error) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Unknown Error';
          }
        },
        next: (res: any) => {
          this.creating = false;
          if (res.message === 'Sql Executed') {
            this.router.navigate([
              `/dashboard/application/${this.applicationId}/entities`,
            ]);
          } else {
            this.enableAfterCreateError();
            this.errorMessage = 'Unknown Error.';
          }
        },
      });
  }
}
