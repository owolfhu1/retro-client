import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateComponent, CreateDialogComponent } from './create/create.component';
import { HomeComponent } from './home/home.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule, MatCheckboxModule,
  MatChipsModule,
  MatDialogModule, MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatToolbarModule, MatTooltipModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { InstanceComponent, WriteDialogComponent } from './instance/instance.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StatementComponent } from './statement/statement.component';
import {ScrollingModule} from '@angular/cdk/scrolling';

// const config: SocketIoConfig = { url: 'http://localhost:4242', options: {} };
const config: SocketIoConfig = { url: 'https://retroserver.herokuapp.com/', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    CreateComponent,
    HomeComponent,
    CreateDialogComponent,
    InstanceComponent,
    WriteDialogComponent,
    StatementComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    MatCardModule,
    DragDropModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatTooltipModule,
    MatCheckboxModule,
    ScrollingModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateDialogComponent,
    WriteDialogComponent,
  ]
})
export class AppModule { }

// ng build --prod --output-path docs --base-href /retro-client/
// https://owolfhu1.github.io/retro-client
