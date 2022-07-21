import { EditApplicationComponent } from './edit-application/edit-application.component';
import { DeleteApplicationComponent } from './delete-application/delete-application.component';
import { CreateApplicationComponent } from './create-application/create-application.component';
import { Application, ApplicationsService } from './applications.service';
import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
})
export class ApplicationsComponent implements OnDestroy, AfterViewInit {
  errorMessage!: string | undefined;
  displayedColumns: string[] = [
    'id',
    'version',
    'name',
    'port',
    'entities',
    'actions',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  reload = new BehaviorSubject<number>(0);

  applicationDataSubscription!: Subscription;

  applications: Application[] = [];

  isLoadingResults = true;

  resultsLength = 0;

  pageSize = 10;

  constructor(
    private applicationService: ApplicationsService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.applicationDataSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.applicationDataSubscription = merge(
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
          return this.applicationService
            .getApplications(
              this.sort.direction,
              this.paginator.pageIndex,
              this.sort.active,
              this.pageSize
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
        this.applications = data;
      });
  }

  openCreateDialog() {
    const createContractDialogRef = this.dialog.open(
      CreateApplicationComponent,
      {
        width: '600px',
        maxHeight: '70vh',
      }
    );

    createContractDialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  openDeleteDialog(application: Application) {
    const deleteContractDialogRef = this.dialog.open(
      DeleteApplicationComponent,
      {
        width: '600px',
        maxHeight: '70vh',
        data: application,
      }
    );

    deleteContractDialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  openEditDialog(application: Application) {
    const editSubjectDialogRef = this.dialog.open(EditApplicationComponent, {
      width: '600px',
      maxHeight: '70vh',
      data: application,
    });

    editSubjectDialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  goToApplicationEntities(application: Application) {
    this.router.navigate([`/dashboard/application/${application.id}/entities`]);
  }

  afterDialogCloseHandle(res: any) {
    if (res) {
      this.reload.next(this.reload.value + 1);
    }
  }
}
