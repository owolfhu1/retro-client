import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { SocketService } from './socket.service';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'pdf-dialog',
  template: `
    <div #content>
        <div>
            <h1>Went Well</h1>
            <div *ngFor="let statement of socketService.instance.goods">
                <h3>{{ statement.text }}</h3>
                <p>
                    upvotes: {{ statement.ups.length }}, downvotes: {{ statement.downs.length }}
                </p>
                <ul *ngIf="statement.comments.length">
                    <li *ngFor="let comment of statement.comments">
                        {{ comment.text }}
                        <p>
                            upvotes: {{ comment.ups.length }}, downvotes: {{ comment.downs.length }}
                        </p>
                    </li>
                </ul>
                <br *ngIf="!statement.comments.length">
                <br *ngIf="!statement.comments.length">
            </div>
        </div>

        <div>
            <h1>Not Well</h1>
            <div *ngFor="let statement of socketService.instance.bads">
                <h3>{{ statement.text }}</h3>
                <p>
                    upvotes: {{ statement.ups.length }}, downvotes: {{ statement.downs.length }}
                </p>
                <ul *ngIf="statement.comments.length">
                    <li *ngFor="let comment of statement.comments">
                        {{ comment.text }}
                        <p>
                            upvotes: {{ comment.ups.length }}, downvotes: {{ comment.downs.length }}
                        </p>
                    </li>
                </ul>
                <br *ngIf="!statement.comments.length">
                <br *ngIf="!statement.comments.length">
            </div>
        </div>

        <div>
            <h1>Actions</h1>
            <div *ngFor="let statement of socketService.instance.actions">
                <h3>{{ statement.text }}</h3>
                <p>
                    upvotes: {{ statement.ups.length }}, downvotes: {{ statement.downs.length }}
                </p>
                <ul *ngIf="statement.comments.length">
                    <li *ngFor="let comment of statement.comments">
                        {{ comment.text }}
                        <p>
                            upvotes: {{ comment.ups.length }}, downvotes: {{ comment.downs.length }}
                        </p>
                    </li>
                </ul>
                <br *ngIf="!statement.comments.length">
                <br *ngIf="!statement.comments.length">
            </div>
        </div>

        <div>
            <h1>Trash</h1>
            <div *ngFor="let statement of socketService.instance.trash">
                <h3>{{ statement.text }}</h3>
                <p>
                    upvotes: {{ statement.ups.length }}, downvotes: {{ statement.downs.length }}
                </p>
                <ul *ngIf="statement.comments.length">
                    <li *ngFor="let comment of statement.comments">
                        {{ comment.text }}
                        <p>
                            upvotes: {{ comment.ups.length }}, downvotes: {{ comment.downs.length }}
                        </p>
                    </li>
                </ul>
                <br *ngIf="!statement.comments.length">
                <br *ngIf="!statement.comments.length">
            </div>
        </div>
    </div>
  `,
})
export class PdfPrinterComponent implements OnInit {
  @ViewChild('content', null) content: ElementRef;
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
