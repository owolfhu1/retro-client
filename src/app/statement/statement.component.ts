import {Component, Input, OnInit, Output} from '@angular/core';
import {SocketService} from '../socket.service';
import {MatDialog} from '@angular/material';
import {WriteDialogComponent} from '../instance/instance.component';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.css']
})
export class StatementComponent implements OnInit {
  @Input() statement;

  constructor(
    public socketService: SocketService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
  }

  vote(type) {
    this.socketService.emit('vote-' + type, this.statement.id);
  }

  commentVote(type, index) {
    this.socketService.emit('comment-vote-' + type, { statementId: this.statement.id, index });
  }

  unCommentVote(type, index) {
    this.socketService.emit('un-comment-vote-' + type, { statementId: this.statement.id, index });
  }

  get canEdit() {
    return this.socketService.instance.owner === this.socketService.name
      || this.statement.author === this.socketService.name;
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
    let votes = 0;
    obj[type].forEach(name => votes += name === this.socketService.name ? 1 : 0);
    return votes === 0 ? null : votes + '';
  }

  iVoted(obj, type): boolean {
    return obj[type].indexOf(this.socketService.name) > -1;
  }

  unVote(type) {
    this.socketService.emit('un-vote-' + type, this.statement.id);
  }
}
