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
}

export interface Statement {
  ups: number;
  downs: number;
  comments: Comment[];
  text: string;
  id: string;
  author: string;
}

export interface Comment {
  ups: number;
  downs: number;
  text: string;
}
