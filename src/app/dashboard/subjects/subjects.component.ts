import { CreateSubjectComponent } from './create-subject/create-subject.component';
import { DeleteSubjectComponent } from './delete-subject/delete-subject.component';
import { EditSubjectComponent } from './edit-subject/edit-subject.component';
import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { Subject, SubjectService } from './subject.service';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent implements OnDestroy, AfterViewInit {
  errorMessage!: string | undefined;

  displayedColumns: string[] = ['id', 'identifier', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  reload = new BehaviorSubject<number>(0);

  subjectDataSubscription!: Subscription;

  subjects: Subject[] = [];

  isLoadingResults = true;

  resultsLength = 0;

  pageSize = 10;

  constructor(
    private subjectService: SubjectService,
    public dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.subjectDataSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subjectDataSubscription = merge(
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
          return this.subjectService
            .getSubjects(
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
        this.subjects = data;
      });
  }

  openCreateDialog() {
    const createContractDialogRef = this.dialog.open(CreateSubjectComponent, {
      width: '600px',
      maxHeight: '70vh',
    });

    createContractDialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  openDeleteDialog(subject: Subject) {
    const deleteContractDialogRef = this.dialog.open(DeleteSubjectComponent, {
      width: '600px',
      maxHeight: '70vh',
      data: subject,
    });

    deleteContractDialogRef
      .afterClosed()
      .pipe(first())
      .subscribe({
        next: (res) => {
          this.afterDialogCloseHandle(res);
        },
      });
  }

  openEditDialog(subject: Subject) {
    const editSubjectDialogRef = this.dialog.open(EditSubjectComponent, {
      width: '600px',
      maxHeight: '70vh',
      data: subject,
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

  afterDialogCloseHandle(res: any) {
    if (res) {
      this.reload.next(this.reload.value + 1);
    }
  }
}
