import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Message, SocketService } from './socket.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { PdfPrinterComponent } from './pdf-printer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  introMessage = `Welcome to Orion's retrospective application.`;

  chattingWith: string;
  unreadMessages: { [key: string]: number } = {};

  constructor(
    public socketService: SocketService,
    private dialog: MatDialog,
  ) {
    socketService.socket.fromEvent<string>('test').subscribe(content => {
      dialog.open(InfoDialogComponent, { data: { title: 'Server Message', content }, width: '600px' });
    });
    socketService.systemMessage.subscribe(content => {
      dialog.open(InfoDialogComponent, { data: { title: 'Client Message', content }, width: '600px' });
    });
    socketService.socket.fromEvent<string>('deleted-instance').subscribe(() => {
      this.dialog.open(InfoDialogComponent, {
        data: {
          title: 'Deleted Instance',
          content: 'The instance you were viewing has been deleted.',
        },
        width: '600px',
      }).afterClosed().subscribe(() => {
        document.location.reload();
      });
    });
    socketService.socket.fromEvent<Message>('chat').subscribe(message => {
      if (message.name !== this.chattingWith) {
        this.unreadMessages[message.name] = (this.unreadMessages[message.name] || 0) + 1;
        document.getElementById(message.name).animate(
          [
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(0)' },
            { transform: 'translateY(5px)' },
            { transform: 'translateY(-5px)' },
            { transform: 'translateY(0)' },
          ],
          {
            duration: 110,
            iterations: 15,
          }
        );
      }
    });
  }

  chat(name: string) {
    if (name === this.socketService.name) {
      this.socketService.systemMessage.next('you can\'t chat with yourself');
    } else {
      this.chattingWith = name;
      this.unreadMessages[name] = null;
      this.dialog.open(ChatDialogComponent, {
        width: '600px',
        data: { name },
      }).afterClosed().subscribe(() => this.chattingWith = null);
    }
  }

  onLockPress() {
    if (this.socketService.instance.owner === this.socketService.name) {
      this.socketService.emit('lock', null);
    }
  }

  about() {
    this.dialog.open(InfoDialogComponent, {
      data: {
        title: 'Retrospective Application created by Orion Wolf-Hubbard',
        content: 'Contact: owolfhu1@gmail.com',
      },
      width: '600px',
    });
  }

  delete() {
    if (this.socketService.instance.owner === this.socketService.name) {
      this.dialog.open(InfoDialogComponent, {
        data: {
          title: 'Confirmation',
          content: 'Are you sure you wish to permanently delete this instance?',
          cancelable: true,
        },
        width: '600px',
      }).afterClosed().subscribe(doDelete => {
        if (doDelete) {
          if (this.socketService.instance.title === 'demo') {
            this.dialog.open(InfoDialogComponent, {
              data: {
                title: 'Sorry',
                content: 'You can not delete the demo instance.',
              },
              width: '600px',
            });
          } else { this.socketService.emit('delete-instance'); };
        }
      });
    }
  }

  newInstance() {
    const prod = window.location.href.indexOf('/retro-client/') > -1;
    window.location.href = window.location.href.replace(window.location.pathname, prod ? 'retro-client/create' : '/create');
  }

  downloadCSV() {
    const instance = this.socketService.instance;

    const makeRow = (obj, array, prefix) => {
      const arr = [prefix];
      arr.push(obj.text.replace(/\r?\n|\r/g, '/'));
      arr.push(obj.ups.length);
      arr.push(obj.downs.length);
      if (obj.emoji) {
        const strings = [];
        obj.emoji.forEach(emoji => {
          strings.push(`(${emoji.emoji.native} - ${emoji.names.join('/')})`);
        });
        arr.push(strings.join(' '));
      }
      array.push(arr);
      if (obj.comments) {
        obj.comments.forEach(comment => makeRow(comment, array, 'comment'));
      }
    };

    const csv = [`Participants:,${Object.keys(instance.votes).join(',')}`];

    csv.push('TYPE,STATEMENT,UP VOTES,DOWN VOTES,EMOJI');

    instance.columns.forEach(col => {
      const items = [[col.text]];
      col.items.forEach(item => {
        makeRow(item, items, '');
      });
      csv.push(items.join('\r\n'));
    });

    const junks = [['Trash']];
    instance.trash.forEach(rubbage => {
      makeRow(rubbage, junks, '');
    });
    csv.push(junks.join('\r\n'));

    const csvArray = csv.join('\r\n\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = this.socketService.instance.title + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  downloadPDF() {
    this.dialog.open(PdfPrinterComponent, { width: '2000px'});
  }

  chipToolTip(name) {
    if (this.socketService.name === name) {
      return '';
    }
    if (this.unreadMessages[name]) {
      return `You have ${this.unreadMessages[name]} unread message${this.unreadMessages[name] > 1 ? 's' : ''} from ${name}`;
    }
    return `chat with ${name}`;
  }
}

@Component({
  selector: 'info-dialog',
  template: `
    <h3>{{ title }}</h3>
    <p>{{ content }}</p>
    <div class="right-buttons">
      <button mat-fab color="warn" *ngIf="cancelable" (click)="close()">
        <mat-icon>clear</mat-icon>
      </button>
      &nbsp;&nbsp;
      <button mat-fab color="primary" (click)="close(true)">
        <mat-icon>check</mat-icon>
      </button>
    </div>
  `,
})
export class InfoDialogComponent {
  title: string;
  content: string;
  cancelable: boolean;

  constructor(
    public socketService: SocketService,
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.title = data.title;
    this.content = data.content;
    this.cancelable = data.cancelable;
  }

  close(yes = false) {
    this.dialogRef.close(yes);
  }
}

@Component({
  selector: 'chat-dialog',
  template: `
    <h2 class="header">Private chat with {{ name }}</h2>
    <mat-card class="body">
      <i *ngIf="socketService.typingMap[name]">{{ name }} is typing...</i>

      <mat-card
        [ngClass]="{ incoming: message.name === name, outgoing: message.name !== name, message: true }"
        *ngFor="let message of socketService.conversations[name]">
          <b>{{ message.name }}</b>: {{ message.message }}
      </mat-card>
    </mat-card>
    <span class="input-wrapper">
      <mat-form-field class="full" appearance="outline" color="accent">
        <input (ngModelChange)="inputChanges($event)" autocomplete="off" class="full" matInput (keyup.enter)="send()" [(ngModel)]="input">
        <button mat-icon-button color="accent" matTooltip="send message" [disabled]="!input" matSuffix (click)="send()">
          <mat-icon>send</mat-icon>
        </button>
      </mat-form-field>
    </span>
    <button class="close" mat-icon-button (click)="dialogRef.close()"><mat-icon>remove_circle</mat-icon></button>
  `,
  styles: [`
    :host {
      position: relative;
      padding-bottom: 0;
    }
    .incoming { background: dimgray; }
    .outgoing {
        /*background: gray; */
    }
    .body {
      height: 400px;
      display: flex;
      flex-direction: column-reverse;
      overflow-y: scroll;
        border: gray solid 1px;
      padding: 5px;
    }
    .header {
      margin-top: 0;
    }
    .close {
      position: absolute;
      top: -10px;
      right: -5px;
    }
    .message {
      padding: 5px 10px;
      margin: 5px 0 0;
      border-radius: 15px;
    }
    .body::-webkit-scrollbar {
      display: none;
    }
    .body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .full {
      width: 100%;
    }
    .input-wrapper::ng-deep.mat-form-field-wrapper {
        padding: 0;
    }
    .input-wrapper::ng-deep.mat-form-field-infix {
        border-top: 0;
        padding-bottom: 3px;
        padding-top: 0;
    }
    .input-wrapper::ng-deep.mat-form-field {
        line-height: 2;
    }
  `],
})
export class ChatDialogComponent implements OnDestroy {
  name: string;
  input = '';

  constructor(
    public socketService: SocketService,
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.name = data.name;
    if (!socketService.conversations[this.name]) {
      socketService.conversations[this.name] = [];
    }
  }

  inputWas = '';
  inputChanges(incoming) {
    if (!this.inputWas && incoming) {
      this.socketService.startTyping(this.name);
    } else if (this.inputWas && !incoming) {
      this.socketService.stopTyping(this.name);
    }
    this.inputWas = incoming;
  }

  send() {
    if (this.input) {
      this.socketService.sendMessage(this.input, this.name);
      this.input = '';
      this.inputChanges('');
    }
  }

  close(yes = false) {
    this.dialogRef.close(yes);
  }

  ngOnDestroy(): void {
    this.inputChanges('');
  }
}
