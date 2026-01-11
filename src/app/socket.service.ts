import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';

export interface Conversations {
  [name: string]: Message[];
}

export interface Message {
  name: string;
  message: string;
}

class SocketWrapper {
  constructor(private socket: Socket) {}

  fromEvent<T>(eventName: string): Observable<T> {
    return new Observable<T>(subscriber => {
      const handler = (data: T) => subscriber.next(data);
      this.socket.on(eventName, handler);
      return () => this.socket.off(eventName, handler);
    });
  }

  emit(eventName: string, data?: unknown) {
    this.socket.emit(eventName, data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  name: string;
  instance: any;
  lastAction: any;
  isBeingReset = false;
  goToInstance: Observable<{instance: any, name: string}>;
  systemMessage: Subject<string> = new Subject();
  typingMap: { [name: string]: boolean } = {};
  conversations: Conversations = {};
  minimizedMap: { [id: string]: boolean } = {};
  minimizeCommentsMap: { [id: string]: boolean } = {};

  public socket: SocketWrapper;

  constructor() {
    const socketUrl = environment.socketUrl || window.location.origin;
    const client = io(socketUrl);
    this.socket = new SocketWrapper(client);
    this.goToInstance = this.socket.fromEvent<{instance: any, name: string}>('goToInstance');

    this.socket.fromEvent<string>('console').subscribe(console.log);
    this.socket.fromEvent<any>('instance').subscribe(instance => this.instance = instance);
    this.socket.fromEvent<string>('set-name').subscribe(name => {
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
    this.socket.fromEvent<void>('reset').subscribe(_ => {
      this.isBeingReset = true;
      this.socket.emit('join', { name: this.name, instanceId: this.instance.title });
    });
    setInterval(() => this.emit('ping', 'stay alive'), 60000);
    this.socket.fromEvent<Message>('chat').subscribe((message: Message) => {
      if (!this.conversations[message.name]) {
        this.conversations[message.name] = [];
      }
      this.conversations[message.name].unshift(message);
    });
    this.socket.fromEvent<string>('typing-start').subscribe(name => this.typingMap[name] = true);
    this.socket.fromEvent<string>('typing-stop').subscribe(name => this.typingMap[name] = false);
  }

  get offlineUsers() {
    return Object.keys(this.instance.votes).filter(user => this.instance.users.indexOf(user) < 0);
  }

  minimize(id) {
    this.minimizedMap[id] = !this.minimizedMap[id];
  }

  minimizeComments(id) {
    this.minimizeCommentsMap[id] = !this.minimizeCommentsMap[id];
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
