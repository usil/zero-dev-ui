import { forkJoin, first, Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Entity, EntityService, EntitySubjects } from '../entity.service';
import {
  Subject,
  SubjectService,
} from 'src/app/dashboard/subjects/subject.service';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent implements OnInit {
  editEntitySubjectsForm!: FormGroup;
  subjectsCrudFormArray!: FormArray;
  errorMessage!: string;
  subjects: Subject[] = [];
  entitySubjects: EntitySubjects[] = [];
  creating = false;

  constructor(
    public dialogRef: MatDialogRef<SubjectsComponent>,
    @Inject(MAT_DIALOG_DATA) public entity: Entity,
    private formBuilder: FormBuilder,
    private entityService: EntityService,
    private subjectService: SubjectService
  ) {
    forkJoin({
      subjects: this.subjectService.getSubjects('asc', 0, 'id', 100000),
      entitySubjects: this.entityService.getEntitySubjects(
        this.entity.id as number
      ),
    })
      .pipe(first())
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
          if (res) {
            this.subjects = res.subjects.content.items as Subject[];
            this.entitySubjects = res.entitySubjects.content;

            this.initForm();
          }
        },
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  addSubjectCrud(subjectId?: number, crudExtension?: string) {
    const baseFormGroup = this.formBuilder.group({
      subject: this.formBuilder.control(
        subjectId || '',
        Validators.compose([Validators.required])
      ),
      crudExtension: this.formBuilder.control(
        crudExtension || 'CRUD',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[CRUD]+$/),
        ])
      ),
    });

    this.subjectsCrudFormArray.push(baseFormGroup);
  }

  initForm() {
    this.editEntitySubjectsForm = this.formBuilder.group({
      subjects_crud: this.formBuilder.array([]),
    });

    this.subjectsCrudFormArray = this.editEntitySubjectsForm.get(
      'subjects_crud'
    ) as FormArray;

    for (const entitySubject of this.entitySubjects) {
      this.addSubjectCrud(entitySubject.subjectId, entitySubject.crudExtension);
    }
  }

  updateEntitySubjects(formData: {
    subjects_crud: {
      subject: number;
      crudExtension: string;
    }[];
  }) {
    const entitySubjectsToDelete: number[] = [];

    const entitySubjectsToUpdate: {
      subjectEntityId: number;
      crudExtension: string;
    }[] = [];

    const entitySubjectsToCreate: {
      subjectId: number;
      entityId: number;
      crudExtension: string;
    }[] = [];

    for (const es of this.entitySubjects) {
      const index = formData.subjects_crud.findIndex(
        (sc) => sc.subject === es.subjectId
      );

      if (index < 0) {
        entitySubjectsToDelete.push(es.id);
      } else {
        entitySubjectsToUpdate.push({
          subjectEntityId: es.id,
          crudExtension: formData.subjects_crud[index].crudExtension,
        });
      }
    }

    for (const sc of formData.subjects_crud) {
      const index = this.entitySubjects.findIndex(
        (es) => es.subjectId === sc.subject
      );

      if (index === -1) {
        entitySubjectsToCreate.push({
          subjectId: sc.subject,
          entityId: this.entity.id as number,
          crudExtension: sc.crudExtension,
        });
      }
    }

    const obsFork: Record<string, Observable<any>> = {};

    if (entitySubjectsToCreate.length > 0) {
      obsFork['created'] =
        this.entityService.createSubjectEntityRelationshipFromUpdate(
          entitySubjectsToCreate
        );
    }

    if (entitySubjectsToUpdate.length > 0) {
      obsFork['updated'] = forkJoin(
        entitySubjectsToUpdate.map((esToUpdate) =>
          this.entityService.updateEntitySubjectRelationship(esToUpdate)
        )
      ).pipe(first());
    }

    if (entitySubjectsToDelete.length > 0) {
      obsFork['deleted'] = forkJoin(
        entitySubjectsToDelete.map((id) =>
          this.entityService.deleteEntitySubjectRelationship(id)
        )
      ).pipe(first());
    }

    if (obsFork['created'] || obsFork['updated'] || obsFork['deleted']) {
      this.editEntitySubjectsForm.disable();

      this.creating = true;

      forkJoin({ ...obsFork })
        .pipe(first())
        .subscribe({
          error: (err) => {
            this.creating = false;
            this.editEntitySubjectsForm.enable();
            if (err.error) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = 'Unknown Error';
            }
          },
          next: (res: any) => {
            this.creating = false;
            if (res) {
              this.dialogRef.close(true);
            } else {
              this.editEntitySubjectsForm.enable();
              this.errorMessage = 'Unknown Error.';
            }
          },
        });
    } else {
      this.dialogRef.close(true);
    }
  }

  removeSubjectCrud(groupIndex: number): void {
    this.subjectsCrudFormArray.removeAt(groupIndex);
  }

  ngOnInit(): void {}
}
