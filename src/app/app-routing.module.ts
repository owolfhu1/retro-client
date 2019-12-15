import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {CreateComponent} from './create/create.component';
import {InstanceComponent} from './instance/instance.component';

const routes: Routes = [
  { path: '',  component: HomeComponent },
  { path: 'create',  component: CreateComponent },
  { path: 'instance/:id',  component: InstanceComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
