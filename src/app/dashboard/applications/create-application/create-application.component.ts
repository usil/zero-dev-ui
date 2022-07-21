import { Application, ApplicationsService } from './../applications.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss'],
})
export class CreateApplicationComponent {
  createApplicationForm: FormGroup;
  errorMessage!: string;

  constructor(
    public dialogRef: MatDialogRef<CreateApplicationComponent>,
    private formBuilder: FormBuilder,
    private createApplicationService: ApplicationsService
  ) {
    this.createApplicationForm = this.formBuilder.group({
      name: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(4),
          Validators.maxLength(40),
        ])
      ),
      version: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9\.]+$/),
          Validators.minLength(5),
          Validators.maxLength(8),
        ])
      ),
      port: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[\d]+$/),
          Validators.maxLength(4),
        ])
      ),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createApplication(createApplicationFormData: Application) {
    this.dialogRef.disableClose = true;
    this.createApplicationService
      .createApplication({ ...createApplicationFormData })
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
          this.dialogRef.close(res.content);
        },
      });
  }
}
