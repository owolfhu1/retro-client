import { Component, Inject, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.css']
})
export class InstanceComponent implements OnInit {
  nameInput = '';
  title = '';
  minimizeTrash = false;

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
      if (this.socketService.disabled) {
        this.socketService.systemMessage.next('You can not edit a locked instance.');
        return;
      }
      const lastIndex = event.previousIndex;
      const nextIndex = event.currentIndex;
      const lastList = event.previousContainer.id;
      const nextList = event.container.id;
      const tempItem = lastList === 'trash' ?
        this.socketService.instance[lastList][lastIndex] :
        this.socketService.instance.columns[lastList].items[lastIndex];
      const id = tempItem.id;
      if (
        tempItem.author !== this.socketService.name &&
        this.socketService.instance.owner !== this.socketService.name
      ) {
        this.socketService.systemMessage.next('You may only move your own statements.');
      } else {
        const item = (lastList === 'trash' ?
          this.socketService.instance[lastList] :
          this.socketService.instance.columns[lastList].items).splice(lastIndex, 1)[0];
        this.socketService.instance.columns[nextList].items.splice(nextIndex, 0, item);
        this.socketService.emit('drop', { lastIndex, nextIndex, lastList, nextList, id });
      }
    }
  }

  trash(event: CdkDragDrop<Statement[]> | any) {
    if (event.isPointerOverContainer || event.manual) {
      if (this.socketService.disabled) {
        this.socketService.systemMessage.next('You can not edit a locked instance.');
        return;
      }
      const lastIndex = event.manual ? event.lastIndex : event.previousIndex;
      const nextIndex = event.manual ? null : event.currentIndex;
      const lastList = event.manual ? event.lastList : event.previousContainer.id;
      const tempItem = lastList === 'trash' ?
        this.socketService.instance[lastList][lastIndex] :
        this.socketService.instance.columns[lastList].items[lastIndex];
      const id = tempItem.id;
      if (
        tempItem.author !== this.socketService.name &&
        this.socketService.instance.owner !== this.socketService.name
      ) {
        this.socketService.systemMessage.next('You may only move your own statements.');
      } else {
        const item = (lastList === 'trash' ?
          this.socketService.instance[lastList] :
          this.socketService.instance.columns[lastList].items).splice(lastIndex, 1)[0];
        item.from = lastList;
        this.socketService.instance.trash.splice(nextIndex, 0, item);
        this.socketService.emit('trash', { lastIndex, nextIndex, lastList, id });
      }
    }
  }

  trashColor(junk) {
    return (this.socketService.instance.columns[junk.from] || {}).color;
  }

  canDelete(index): boolean {
    const statement = this.socketService.instance.trash[index];
    const isOwner = this.socketService.instance.owner === this.socketService.name;
    return isOwner ? true : statement.author === this.socketService.name;
  }

  delete(index) {
    const item = this.socketService.instance.trash[index];
    if (this.socketService.instance.owner === this.socketService.name) {
      this.socketService.emit('delete', index);
    } else {
      if (item.author !== this.socketService.name) {
        this.socketService.systemMessage.next('You may only delete your own statements.');
      } else if (item.comments.length > 0) {
        this.socketService.systemMessage.next('Only the instance owner can delete statements with comments.');
      } else {
        this.socketService.emit('delete', index);
      }
    }
  }

  deleteAll() {
    this.socketService.emit('delete-all', null);
  }

  join() {
    const name = this.nameInput.replace(' ', '');
    if (!name) { return; }
    this.socketService.emit('join', { instanceId: this.title, name });
  }

  write(type) {
    this.dialog.open(WriteDialogComponent, { width: '600px', panelClass: 'panel', data: {
      type, anonymous: true, what: 'statement',
    }}).afterClosed().subscribe(value => {
      if (value) {
        this.socketService.emit('new-statement', { type, value: value.text, anonymous: value.anonymous });
      }
    });
  }

  displayJunk (junk) {
    return junk.text.substring(0, 10);
  }

  background(main) {
    switch (main) {
      case 'green' : return 'lightgreen';
      case 'blue' : return 'cornflowerblue';
      case 'purple' : return 'mediumpurple';
      case 'darkred' : return 'lightcoral';
      case 'orangered' : return 'orange';
      case 'yellowgreen' : return 'yellow';
      case 'deeppink' : return 'pink';
      case 'gray' : return 'lightgray';
    }
  }
}


@Component({
  selector: 'write-dialog',
  template: `
    <h2>
      {{ isEdit ? 'Editing' : 'Creating' }} {{ what }}
      <span *ngIf="what === 'statement'">in {{ type }} column</span>
    </h2>

    <div class="editor-wrapper">
      <mat-form-field color="accent" appearance="outline" style="width: 100%">
        <textarea rows="10" matInput [(ngModel)]="text"></textarea>
      </mat-form-field>
    </div>

    <div class="flex">
      <mat-checkbox [disabled]="isEdit && socketService.name !== author" [(ngModel)]="anonymous">Anonymous</mat-checkbox>

      <div>
        <button mat-mini-fab color="warn" matTooltip="cancel" (click)="dialogRef.close()">
          <mat-icon>clear</mat-icon>
        </button>
        &nbsp;
        <button [matTooltip]="isEdit ? 'update' : 'submit'" [disabled]="!text" mat-mini-fab color="primary" (click)="close()">
          <mat-icon *ngIf="!isEdit">add</mat-icon>
          <mat-icon *ngIf="isEdit">done</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h2 {
      margin-top: 0;
    }
    .editor-wrapper::ng-deep.mat-form-field-infix {
      border-top: none;
    }
  `]
})
export class WriteDialogComponent {
  text: string;
  isEdit: boolean;
  anonymous: boolean;
  type: string;
  what: string;
  author: string;

  constructor(
    public socketService: SocketService,
    public dialogRef: MatDialogRef<WriteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.text = data.text;
    this.isEdit = !!data.text;
    this.type = data.type;
    this.anonymous = data.anonymous;
    this.what = data.what;
    this.author = data.author;
  }

  close() {
    if (this.socketService.instance.locked && this.socketService.instance.owner !== this.socketService.name) {
      this.socketService.systemMessage.next('You can not do that, the instance has been locked.');
      this.dialogRef.close();
    } else {
      this.dialogRef.close({ text: this.text, anonymous: this.anonymous });
    }
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
