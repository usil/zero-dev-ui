import { EditApplicationComponent } from './applications/edit-application/edit-application.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashBoardMaterials } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NodebootOauth2StarterModule } from 'nodeboot-oauth2-starter-ui';
import { AccessComponent } from './access/access.component';
import { UserComponent } from './access/user/user.component';
import { ApplicationResourceComponent } from './access/application-part/application-resource.component';
import { ClientComponent } from './access/client/client.component';
import { RoleComponent } from './access/role/role.component';
import { UserProfileComponent } from './access/user-profile/user-profile.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { EditSubjectComponent } from './subjects/edit-subject/edit-subject.component';
import { DeleteSubjectComponent } from './subjects/delete-subject/delete-subject.component';
import { CreateSubjectComponent } from './subjects/create-subject/create-subject.component';
import { ApplicationsComponent } from './applications/applications.component';
import { CreateApplicationComponent } from './applications/create-application/create-application.component';
import { DeleteApplicationComponent } from './applications/delete-application/delete-application.component';
import { FieldsComponent } from './applications/fields/fields.component';
import { EntitiesComponent } from './applications/entities/entities.component';
import { CreateEntityComponent } from './applications/entities/create-entity/create-entity.component';
import { DataOriginComponent } from './applications/entities/data-origin/data-origin.component';
import { SubjectsComponent as EntitySubjectsComponent } from './applications/entities/subjects/subjects.component';
@NgModule({
  declarations: [
    DashboardComponent,
    AccessComponent,
    UserComponent,
    ClientComponent,
    RoleComponent,
    ApplicationResourceComponent,
    UserProfileComponent,
    SubjectsComponent,
    EditSubjectComponent,
    DeleteSubjectComponent,
    CreateSubjectComponent,
    ApplicationsComponent,
    CreateApplicationComponent,
    DeleteApplicationComponent,
    EditApplicationComponent,
    FieldsComponent,
    EntitiesComponent,
    CreateEntityComponent,
    DataOriginComponent,
    EntitySubjectsComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    DashBoardMaterials,
    FormsModule,
    ReactiveFormsModule,
    NodebootOauth2StarterModule,
  ],
})
export class DashboardModule {}
