import { ApplicationsService } from './../applications.service';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Application } from '../applications.service';

@Component({
  selector: 'app-edit-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class EditApplicationComponent {
  errorMessage!: string;
  updateApplicationForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditApplicationComponent>,
    private applicationService: ApplicationsService,
    @Inject(MAT_DIALOG_DATA) public application: Application
  ) {
    this.updateApplicationForm = this.formBuilder.group({
      name: this.formBuilder.control(
        this.application.name,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_\.\-\/]+$/),
          Validators.minLength(4),
          Validators.maxLength(40),
        ])
      ),
      version: this.formBuilder.control(
        this.application.version,
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[0-9\.]+$/),
          Validators.minLength(5),
          Validators.maxLength(8),
        ])
      ),
      port: this.formBuilder.control(
        this.application.port,
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

  updateApplication(updateApplicationData: Application) {
    this.dialogRef.disableClose = true;
    this.applicationService
      .updateApplication(this.application.id as number, updateApplicationData)
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
