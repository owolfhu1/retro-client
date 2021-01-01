import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, InfoDialogComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateComponent, CreateDialogComponent, IconPickerDialogComponent } from './create/create.component';
import { HomeComponent } from './home/home.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule, MatSelectModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { InstanceComponent, WriteDialogComponent } from './instance/instance.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EmojiDialogComponent, StatementComponent } from './statement/statement.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PdfPrinterComponent } from './pdf-printer.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


const config: SocketIoConfig = { url: 'http://localhost:4242', options: {} };
// const config: SocketIoConfig = { url: 'https://retroserver.herokuapp.com/', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    CreateComponent,
    HomeComponent,
    CreateDialogComponent,
    InstanceComponent,
    WriteDialogComponent,
    InfoDialogComponent,
    StatementComponent,
    EmojiDialogComponent,
    PdfPrinterComponent,
    IconPickerDialogComponent,
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
    PickerModule,
    EmojiModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateDialogComponent,
    WriteDialogComponent,
    InfoDialogComponent,
    EmojiDialogComponent,
    PdfPrinterComponent,
    IconPickerDialogComponent,
  ]
})
export class AppModule { }

// ng build --prod --output-path docs --base-href /retro-client/
// make a copy of docs/index.html and name it docs/404.html.
// https://owolfhu1.github.io/retro-client
