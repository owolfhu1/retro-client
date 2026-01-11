import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, InfoDialogComponent, ChatDialogComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateComponent, CreateDialogComponent, IconPickerDialogComponent } from './create/create.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { InstanceComponent, WriteDialogComponent } from './instance/instance.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EmojiDialogComponent, StatementComponent } from './statement/statement.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PdfPrinterComponent } from './pdf-printer.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [
    AppComponent,
    CreateComponent,
    CreateDialogComponent,
    InstanceComponent,
    WriteDialogComponent,
    InfoDialogComponent,
    StatementComponent,
    EmojiDialogComponent,
    PdfPrinterComponent,
    IconPickerDialogComponent,
    ChatDialogComponent,
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
})
export class AppModule { }

// ng build --prod --output-path docs --base-href /retro-client/
// make a copy of docs/index.html and name it docs/404.html.
// https://owolfhu1.github.io/retro-client
