import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateComponent} from './create/create.component';
import {InstanceComponent} from './instance/instance.component';

const routes: Routes = [
  { path: 'create',  component: CreateComponent },
  { path: 'instance/:id',  component: InstanceComponent, pathMatch: 'full' },
  { path: '**', redirectTo: 'instance/demo' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
