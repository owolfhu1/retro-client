import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SocketService} from '../socket.service';
import {MatDialog} from '@angular/material';
import {WriteDialogComponent} from '../instance/instance.component';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.css']
})
export class StatementComponent {
  @Input() statement;
  @Output() trashStatement: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    public socketService: SocketService,
    private dialog: MatDialog,
  ) {}

  vote(type) {
    this.socketService.emit('vote-' + type, this.statement.id);
  }

  commentVote(type, commentId) {
    this.socketService.emit('comment-vote-' + type, { statementId: this.statement.id, commentId });
  }

  unCommentVote(type, commentId) {
    this.socketService.emit('un-comment-vote-' + type, { statementId: this.statement.id, commentId });
  }

  get canEdit(): boolean {
    return this.socketService.instance.owner === this.socketService.name
      || this.statement.author === this.socketService.name;
  }

  canEditComment(index): boolean {
    return this.socketService.instance.owner === this.socketService.name
      || this.statement.comments[index].author === this.socketService.name;
  }

  edit() {
    this.dialog.open(WriteDialogComponent, { width: '300px', data: this.statement.text })
      .afterClosed().subscribe(text => {
        if (text) {
          this.socketService.emit('edit', { statementId: this.statement.id, text });
        }
      });
  }

  comment() {
    this.dialog.open(WriteDialogComponent, { width: '300px' })
      .afterClosed().subscribe(text => {
        if (text) {
          this.socketService.emit('comment', { statementId: this.statement.id, text });
        }
      });
  }

  calcVotes(obj, type) {
    return  obj[type].length === 0 ? null :  obj[type].length + '';
  }

  iVoted(obj, type): boolean {
    return obj[type].indexOf(this.socketService.name) > -1;
  }

  unVote(type) {
    this.socketService.emit('un-vote-' + type, this.statement.id);
  }
}
