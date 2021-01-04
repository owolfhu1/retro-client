import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

export interface Conversations {
  [name: string]: Message[];
}

export interface Message {
  name: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  name: string;
  instance: any;
  lastAction: any;
  isBeingReset = false;
  goToInstance = this.socket.fromEvent<{instance: any, name: string}>('goToInstance');
  systemMessage: Subject<string> = new Subject();
  typingMap: { [name: string]: boolean } = {};
  conversations: Conversations = {};

  constructor(public socket: Socket) {
    socket.fromEvent<string>('console').subscribe(console.log);
    socket.fromEvent<any>('instance').subscribe(instance => this.instance = instance);
    socket.fromEvent<string>('set-name').subscribe(name => {
      this.name = name;
      if (this.isBeingReset) {
        this.isBeingReset = false;
        if (!['delete', 'delete-all', 'delete-instance'].includes(this.lastAction.action)) {
          this.socket.emit(this.lastAction.action, this.lastAction.data);
        } else {
          this.systemMessage.next(
            'WOOPS! Looks like you got out of sync with the server. ' +
            'You have been auto reconnected but deleting is forbidden from this state, ' +
            'please try again.'
          );
        }
      }
    });
    socket.fromEvent<void>('reset').subscribe(_ => {
      this.isBeingReset = true;
      this.socket.emit('join', { name: this.name, instanceId: this.instance.title });
    });
    setInterval(() => this.emit('ping', 'stay alive'), 60000);
    socket.fromEvent<Message>('chat').subscribe((message: Message) => {
      if (!this.conversations[message.name]) {
        this.conversations[message.name] = [];
      }
      this.conversations[message.name].unshift(message);
    });
    socket.fromEvent<string>('typing-start').subscribe(name => this.typingMap[name] = true);
    socket.fromEvent<string>('typing-stop').subscribe(name => this.typingMap[name] = false);
  }

  get offlineUsers() {
    return Object.keys(this.instance.votes).filter(user => this.instance.users.indexOf(user) < 0);
  }

  startTyping(to) {
    this.socket.emit('typing-start', to);
  }

  stopTyping(to) {
    this.socket.emit('typing-stop', to);
  }

  sendMessage(text: string, to: string) {
    const message: Message = { name: this.name, message: text };
    this.conversations[to].unshift(message);
    this.socket.emit('chat', { message, to });
  }

  startInstance(title, votesAllowed, negativeVotesAllowed, owner, emojiAllowed, columns) {
    this.socket.emit('start', { title, votesAllowed, negativeVotesAllowed, owner, emojiAllowed, columns });
  }

  emit(action, data?) {
    this.lastAction = { action, data };
    this.socket.emit(action, data);
  }

  get disabled(): boolean {
    if (!this.instance) { return true; }
    if (this.instance.owner === this.name) { return false; }
    return this.instance.locked;
  }

  get votesLeft() {
    if (!this.instance || !this.name) {
      return 0;
    }
    return this.instance.votes[this.name];
  }
}
