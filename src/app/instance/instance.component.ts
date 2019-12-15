import {Component, Inject, OnInit} from '@angular/core';
import {SocketService} from '../socket.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})
export class InstanceComponent implements OnInit {
  nameInput;
  title;

  constructor(
    public socketService: SocketService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.title = this.router.url.split('/')[2];
  }

  drop(event: CdkDragDrop<Statement[]>) {
    if (event.isPointerOverContainer) {
      const lastIndex = event.previousIndex;
      const nextIndex = event.currentIndex;
      const lastList = event.previousContainer.id;
      const nextList = event.container.id;
      const item = this.socketService.instance[lastList].splice(lastIndex, 1)[0];
      this.socketService.instance[nextList].splice(nextIndex, 0, item);
      this.socketService.emit('drop', { lastIndex, nextIndex, lastList, nextList });
    }
  }

  trash(event: CdkDragDrop<Statement[]>) {
    if (event.isPointerOverContainer) {
      const lastIndex = event.previousIndex;
      const nextIndex = event.currentIndex;
      const lastList = event.previousContainer.id;
      const item = this.socketService.instance[lastList].splice(lastIndex, 1)[0];
      this.socketService.instance.trash.splice(nextIndex, 0, item);
      this.socketService.emit('trash', { lastIndex, nextIndex, lastList });
    }
  }

  trashClass(junk) {
    return {
      'trash-object': true,
      good: junk.from === 'goods',
      bad: junk.from === 'bads',
      action: junk.from === 'actions'
    };
  }

  delete(index) {
    const item = this.socketService.instance.trash[index];
    if (this.socketService.instance.owner === this.socketService.name) {
      this.socketService.emit('delete', index);
    } else {
      if (item.author !== this.socketService.name) {
        alert('You may only delete your own statements.');
      } else if (item.comments.length > 0) {
        alert('Only the instance owner can delete statements with comments.');
      } else {
        this.socketService.emit('delete', index);
      }
    }
  }

  deleteAll() {
    this.socketService.emit('delete-all', null);
  }

  join() {
    this.socketService.emit('join', { instanceId: this.title, name: this.nameInput });
  }

  write(type) {
    this.dialog.open(WriteDialogComponent, { width: '300px' })
      .afterClosed().subscribe(value => {
        if (value) {
          this.socketService.emit('new-' + type, value);
        }
    });
  }

  displayJunk (junk) {
    const length = junk.text.legnth;
    return junk.text.substring(0, length < 17 ? length - 1 : 16);
  }
}


@Component({
  selector: 'write-dialog',
  template: `
      <mat-form-field style="width: 100%">
          <textarea matInput [(ngModel)]="text"></textarea>
      </mat-form-field>
      <br>
      <button mat-fab color="primary" (click)="dialogRef.close(text)">
          <mat-icon *ngIf="!isEdit">add</mat-icon>
          <mat-icon *ngIf="isEdit">done</mat-icon>
      </button>
      &nbsp;&nbsp;
      <button mat-fab color="warn" (click)="dialogRef.close()">
          <mat-icon>clear</mat-icon>
      </button>
  `,
  styles: [`

  `]
})
export class WriteDialogComponent {
  text: string;
  isEdit: boolean;
  constructor(
    public dialogRef: MatDialogRef<WriteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.text = data;
    this.isEdit = !!data;
  }
}


export interface Instance {
  goods: Statement[];
  bads: Statement[];
  actions: Statement[];
  trash: Statement[];
}

export interface Statement {
  ups: number;
  downs: number;
  comments: Comment[];
  text: string;
  id: string;
  author: string;
  from?: string;
}

export interface Comment {
  ups: number;
  downs: number;
  text: string;
}
