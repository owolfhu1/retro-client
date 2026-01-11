import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SocketService } from '../socket.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WriteDialogComponent } from '../instance/instance.component';

@Component({
  selector: 'app-statement',
  templateUrl: './statement.component.html',
  styleUrls: ['./statement.component.css']
})
export class StatementComponent {
  @Input() statement;
  @Input() type;
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
    this.dialog.open(WriteDialogComponent, { width: '600px', data: {
      text: this.statement.text, anonymous: !this.statement.notAnonymous, what: 'statement', author: this.statement.author, type: this.type
    }}).afterClosed().subscribe(data => {
      if (data) {
        this.socketService.emit('edit', { statementId: this.statement.id, text: data.text, anonymous: data.anonymous });
      }
    });
  }

  editComment(commentId, text, notAnonymous, author) {
    this.dialog.open(WriteDialogComponent, { width: '600px', data: {
      text, anonymous: !notAnonymous, what: 'comment', author,
    }}).afterClosed().subscribe(data => {
      if (data) {
        this.socketService.emit('edit-comment', { statementId: this.statement.id, commentId, text: data.text, anonymous: data.anonymous });
      }
    });
  }

  deleteComment(commentId) {
    this.socketService.emit('delete-comment', { statementId: this.statement.id, commentId });
  }

  comment() {
    this.dialog.open(WriteDialogComponent, { width: '600px', data: {
      anonymous: true, what: 'comment',
    }}).afterClosed().subscribe(data => {
      if (data) {
        this.socketService.emit('comment', { statementId: this.statement.id, text: data.text, anonymous: data.anonymous });
      }
    });
  }

  minStatement(text) {
    return text.substring(0, 20);
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

  emoji(emoji) {
    if (this.socketService.disabled) return;
    this.socketService.emit('emoji', {id: this.statement.id, emoji});
  }

  addEmoji() {
    if (this.socketService.disabled) return;
    this.dialog.open(EmojiDialogComponent, { id: 'emoji_wrapper' }).afterClosed().subscribe(emoji => {
      if (emoji) {
        this.socketService.emit('emoji', {id: this.statement.id, emoji});
      }
    });
  }

  commentEmoji(commentId, emoji) {
    if (this.socketService.disabled) return;
    this.socketService.emit('comment-emoji', {id: this.statement.id, emoji, commentId});
  }

  addCommentEmoji(commentId) {
    if (this.socketService.disabled) return;
    this.dialog.open(EmojiDialogComponent, { id: 'emoji_wrapper' }).afterClosed().subscribe(emoji => {
      if (emoji) {
        this.socketService.emit('comment-emoji', {id: this.statement.id, emoji, commentId});
      }
    });
  }

}

@Component({
  selector: 'emoji-dialog',
  template: '<emoji-mart (emojiClick)="close($event)" set="facebook"></emoji-mart>'
})
export class EmojiDialogComponent {
  constructor(public dialogRef: MatDialogRef<EmojiDialogComponent>) {}
  close(event) {
    this.dialogRef.close({
      colons: event.emoji.colons,
      native: event.emoji.native,
    });
  }
}
