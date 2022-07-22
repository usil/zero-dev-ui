import { CreateNewFieldComponent } from './applications/fields/create-new-field/create-new-field.component';
import { FieldsComponent } from './applications/fields/fields.component';
import { CreateEntityComponent } from './applications/entities/create-entity/create-entity.component';
import { EntitiesComponent } from './applications/entities/entities.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from './../guards/admin.guard';
import { ApplicationResourceComponent } from './access/application-part/application-resource.component';
import { ClientComponent } from './access/client/client.component';
import { RoleComponent } from './access/role/role.component';
import { UserProfileComponent } from './access/user-profile/user-profile.component';
import { UserComponent } from './access/user/user.component';

import { DashboardComponent } from './dashboard.component';
import { ApplicationsComponent } from './applications/applications.component';
import { environment } from 'src/environments/environment';

const authRoutes = [
  {
    path: 'auth/users',
    component: UserComponent,
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'auth/clients',
    component: ClientComponent,
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'auth/roles',
    component: RoleComponent,
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'auth/resource',
    component: ApplicationResourceComponent,
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  { path: 'profile', component: UserProfileComponent },
];

const parsedAuhRoutes = environment.customSecurity.useCustomSecurity
  ? authRoutes
  : [];

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      ...parsedAuhRoutes,
      { path: 'applications', component: ApplicationsComponent },
      { path: 'application/:id/entities', component: EntitiesComponent },
      {
        path: 'application/:id/entities/new',
        component: CreateEntityComponent,
      },
      {
        path: 'application/:applicationId/entity/:entityId/fields',
        component: FieldsComponent,
      },
      {
        path: 'application/:applicationId/entity/:entityId/fields/new',
        component: CreateNewFieldComponent,
      },
      { path: 'subjects', component: SubjectsComponent },
      {
        path: '',
        redirectTo: !environment.customSecurity.useCustomSecurity
          ? 'profile'
          : 'applications',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
