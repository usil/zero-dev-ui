import { SubjectService } from './../subject.service';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-subject',
  templateUrl: './create-subject.component.html',
  styleUrls: ['./create-subject.component.scss'],
})
export class CreateSubjectComponent {
  createSubjectForm: FormGroup;
  errorMessage!: string;

  constructor(
    public dialogRef: MatDialogRef<CreateSubjectComponent>,
    private formBuilder: FormBuilder,
    private subjectService: SubjectService
  ) {
    this.createSubjectForm = this.formBuilder.group({
      identifier: this.formBuilder.control(
        '',
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

  createClient(createSubjectFormData: { identifier: string }) {
    this.dialogRef.disableClose = true;
    this.subjectService.createSubject({ ...createSubjectFormData }).subscribe({
      error: (err) => {
        this.dialogRef.disableClose = false;
        if (err.error) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Unknown Error';
        }
      },
      next: (res) => {
        this.dialogRef.close(res.content);
      },
    });
  }
}
