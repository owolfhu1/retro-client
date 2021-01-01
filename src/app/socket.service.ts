import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

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

  constructor(public socket: Socket) {
    socket.fromEvent<string>('console').subscribe(console.log);
    socket.fromEvent<string>('instance').subscribe(instance => this.instance = instance);
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
    setInterval(() => this.emit('ping', 'stay alive'), 600000);
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
