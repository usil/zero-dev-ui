import { Subject, SubjectService } from './../subject.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-subject',
  templateUrl: './delete-subject.component.html',
  styleUrls: ['./delete-subject.component.scss'],
})
export class DeleteSubjectComponent {
  errorMessage!: string;

  constructor(
    public dialogRef: MatDialogRef<DeleteSubjectComponent>,
    private subjectService: SubjectService,
    @Inject(MAT_DIALOG_DATA) public subject: Subject
  ) {}

  delete() {
    this.dialogRef.disableClose = true;
    this.subjectService.deleteSubject(this.subject.id as number).subscribe({
      error: (err) => {
        this.dialogRef.disableClose = false;
        if (err.error) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Unknown Error';
        }
      },
      next: () => {
        this.dialogRef.close(true);
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
