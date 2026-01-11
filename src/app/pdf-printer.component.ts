import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from './socket.service';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'pdf-dialog',
  template: `
    <div #content>

      <div *ngFor="let col of socketService.instance.columns">
        <h1>{{ col.text }}</h1>
        <div *ngFor="let statement of col.items">
          <b>{{ statement.text }}</b><br>
          upvotes: {{ statement.ups.length }}, downvotes: {{ statement.downs.length }}
          <span *ngFor="let e of statement.emoji">
            <br>
            <small><small>{{ e.emoji.colons }} - {{ e.names.join(', ') }}</small></small>
          </span>
          <ul *ngIf="statement.comments.length">
            <li *ngFor="let comment of statement.comments">
              <b>{{ comment.text }}</b><br>
              upvotes: {{ comment.ups.length }}, downvotes: {{ comment.downs.length }}
              <span *ngFor="let e of comment.emoji">
                <br>
                <small><small>{{ e.emoji.colons }} - {{ e.names.join(', ') }}</small></small>
              </span>
            </li>
          </ul>
          <br *ngIf="!statement.comments.length">
        </div>
      </div>

      <div>
        <h1>Trash</h1>
        <div *ngFor="let statement of socketService.instance.trash">
          <b>{{ statement.text }}</b><br>
          upvotes: {{ statement.ups.length }}, downvotes: {{ statement.downs.length }}
          <span *ngFor="let e of statement.emoji">
            <br>
            <small><small>{{ e.emoji.colons }} - {{ e.names.join(', ') }}</small></small>
          </span>
          <ul *ngIf="statement.comments.length">
            <li *ngFor="let comment of statement.comments">
              <b>{{ comment.text }}</b><br>
              upvotes: {{ comment.ups.length }}, downvotes: {{ comment.downs.length }}
              <span *ngFor="let e of comment.emoji">
                <br>
                <small><small>{{ e.emoji.colons }} - {{ e.names.join(', ') }}</small></small>
              </span>
            </li>
          </ul>
          <br *ngIf="!statement.comments.length">
        </div>
      </div>
    </div>
  `,
})
export class PdfPrinterComponent implements OnInit {
  @ViewChild('content', { static: false }) content: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<PdfPrinterComponent>,
    public socketService: SocketService,
    ) {}

    ngOnInit() {
      setTimeout(() => {
        const doc = new jsPDF();
        const elementHandlers = { '#editor': (el, rend) => true };
        doc.fromHTML(this.content.nativeElement.innerHTML, 15, 15, {
          width: '190',
          elementHandlers,
        });
        doc.save(`${this.socketService.instance.title}.pdf`);
        this.dialogRef.close();
      });
    }

}
