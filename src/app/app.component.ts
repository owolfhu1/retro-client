import { Component } from '@angular/core';
import { SocketService } from './socket.service';
import { MatDialog } from '@angular/material';
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
  ) {}

  onLockPress() {
    this.socketService.emit('lock', null);
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
