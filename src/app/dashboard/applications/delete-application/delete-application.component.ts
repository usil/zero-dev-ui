import { ApplicationsService } from './../applications.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Application } from '../applications.service';

@Component({
  selector: 'app-delete-application',
  templateUrl: './delete-application.component.html',
  styleUrls: ['./delete-application.component.scss'],
})
export class DeleteApplicationComponent {
  errorMessage!: string;

  constructor(
    public dialogRef: MatDialogRef<DeleteApplicationComponent>,
    private applicationService: ApplicationsService,
    @Inject(MAT_DIALOG_DATA) public application: Application
  ) {}

  delete() {
    this.dialogRef.disableClose = true;
    this.applicationService
      .deleteApplication(this.application.id as number)
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

  closeDialog() {
    this.dialogRef.close();
  }
}
