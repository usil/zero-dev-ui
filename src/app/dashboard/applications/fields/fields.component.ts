import { Entity, EntityService } from './../entities/entity.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroupDirective } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  merge,
  skip,
  startWith,
  switchMap,
  catchError,
  of,
  map,
  BehaviorSubject,
  Subscription,
} from 'rxjs';
import { Field, FieldsService } from './fields.service';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss'],
})
export class FieldsComponent implements OnInit, OnDestroy {
  entityId: number;
  applicationId: number;
  errorMessage!: string | undefined;
  entity!: Entity;

  displayedColumns: string[] = [
    'id',
    'name',
    'dataOrigin',
    'viewListConfig',
    'inputViewConfiguration',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  reload = new BehaviorSubject<number>(0);

  fieldsSubscription!: Subscription;

  isLoadingResults = true;

  fields: Field[] = [];

  resultsLength = 0;

  pageSize = 10;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private entityService: EntityService,
    private fieldsService: FieldsService
  ) {
    const params = this.activatedRoute.snapshot.params as {
      applicationId: string;
      entityId: string;
    };
    this.applicationId = parseInt(params.applicationId);
    this.entityId = parseInt(params.entityId);

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
        console.log(this.entity);
        this.searchFields();
      },
    });
  }

  ngOnDestroy(): void {
    this.fieldsSubscription?.unsubscribe();
  }

  searchFields() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.fieldsSubscription = merge(
      this.sort.sortChange,
      this.paginator.page,
      this.reload
    )
      .pipe(
        skip(1),
        startWith({}),
        switchMap(() => {
          this.errorMessage = undefined;
          this.isLoadingResults = true;
          return this.fieldsService
            .getFields(
              this.sort.direction,
              this.paginator.pageIndex,
              this.sort.active,
              this.pageSize,
              this.entityId
            )
            .pipe(
              catchError((err) => {
                if (err.error) {
                  this.errorMessage = err.error.message;
                } else {
                  this.errorMessage = 'Unknown Error';
                }
                return of(null);
              })
            );
        }),
        map((data) => {
          this.isLoadingResults = false;
          if (data === null) {
            return [];
          }
          this.resultsLength = data.content?.totalItems || 0;
          return data.content?.items || [];
        })
      )
      .subscribe((data) => {
        console.log(data);
        this.fields = data;
      });
  }

  ngOnInit(): void {}

  goToCreateNewField() {}

  viewDataOrigin(field: Field) {}

  goToNewField() {
    this.router.navigate([
      `/dashboard/application/${this.applicationId}/entity/${this.entityId}/fields/new`,
    ]);
  }
}
