import { Component, Inject } from '@angular/core';
import { SocketService } from './socket.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { PdfPrinterComponent } from './pdf-printer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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
          this.socketService.emit('delete-instance');
        }
      });
    }
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

    const goods = [['Went Well']];
    instance.goods.forEach(good => {
      makeRow(good, goods, '');
    });
    csv.push(goods.join('\r\n'));

    const bads = [['Not Well']];
    instance.bads.forEach(bad => {
      makeRow(bad, bads, '');
    });
    csv.push(bads.join('\r\n'));

    const actions = [['Action Items']];
    instance.actions.forEach(action => {
      makeRow(action, actions, '');
    });
    csv.push(actions.join('\r\n'));

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
