import { Application, ApplicationsService } from './../applications.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Entity, EntityService } from './entity.service';
import { FormGroupDirective } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  BehaviorSubject,
  catchError,
  map,
  merge,
  of,
  skip,
  startWith,
  Subscription,
  switchMap,
  first,
} from 'rxjs';
import { DataOriginComponent } from './data-origin/data-origin.component';
import { MatDialog } from '@angular/material/dialog';
import { SubjectsComponent } from './subjects/subjects.component';

@Component({
  selector: 'app-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss'],
})
export class EntitiesComponent implements OnInit, OnDestroy {
  applicationId: number;
  errorMessage!: string | undefined;

  displayedColumns: string[] = [
    'id',
    'name',
    'icon',
    'dataOrigin',
    'subjects',
    'webhooks',
    'fields',
    'actions',
  ];

  entities: Entity[] = [];

  application!: Application;

  isLoadingResults = true;

  resultsLength = 0;

  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  reload = new BehaviorSubject<number>(0);

  entitiesSubscription!: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationsService,
    private entityService: EntityService,
    public dialog: MatDialog
  ) {
    const params = this.activatedRoute.snapshot.params as { id: string };
    this.applicationId = parseInt(params.id);

    this.applicationService.getApplication(this.applicationId).subscribe({
      error: (err) => {
        if (err.error) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Unknown Error';
        }
      },
      next: (res) => {
        this.application = res.content;
        this.searchEntities();
      },
    });
  }

  ngOnDestroy(): void {
    this.entitiesSubscription?.unsubscribe();
  }

  searchEntities() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.entitiesSubscription = merge(
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
          return this.entityService
            .getEntities(
              this.sort.direction,
              this.paginator.pageIndex,
              this.sort.active,
              this.pageSize,
              this.applicationId
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
        this.entities = data;
      });
  }

  goToCreateNewEntity() {
    this.router.navigate([
      `/dashboard/application/${this.applicationId}/entities/new`,
    ]);
  }

  viewDataOrigin(entity: Entity) {
    const dataOriginDialog = this.dialog.open(DataOriginComponent, {
      width: '600px',
      maxHeight: '70vh',
      data: entity,
    });

    dataOriginDialog
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  viewSubjects(entity: Entity) {
    const subjectsDialog = this.dialog.open(SubjectsComponent, {
      width: '600px',
      maxHeight: '70vh',
      data: entity,
    });

    subjectsDialog
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  afterDialogCloseHandle(res: any) {
    if (res) {
      this.reload.next(this.reload.value + 1);
    }
  }

  ngOnInit(): void {}
}
