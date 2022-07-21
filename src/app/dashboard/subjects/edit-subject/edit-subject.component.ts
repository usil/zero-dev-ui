import { Subject, SubjectService } from './../subject.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-subject',
  templateUrl: './edit-subject.component.html',
  styleUrls: ['./edit-subject.component.scss'],
})
export class EditSubjectComponent {
  errorMessage!: string;
  updateSubjectForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditSubjectComponent>,
    private subjectService: SubjectService,
    @Inject(MAT_DIALOG_DATA) public subject: Subject
  ) {
    this.updateSubjectForm = this.formBuilder.group({
      identifier: this.formBuilder.control(
        subject.identifier,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(2),
          Validators.maxLength(40),
        ])
      ),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  updateSubject(updateClientData: Subject) {
    this.dialogRef.disableClose = true;
    this.subjectService
      .updateSubject(this.subject.id as number, updateClientData)
      .subscribe({
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
}
