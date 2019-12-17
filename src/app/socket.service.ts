import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  name: string;
  instance: any;

  goToInstance = this.socket.fromEvent<{instance: any, name: string}>('goToInstance');

  constructor(public socket: Socket) {
    socket.fromEvent<string>('test').subscribe(alert);
    socket.fromEvent<string>('instance').subscribe(instance => this.instance = instance);
    socket.fromEvent<string>('set-name').subscribe(name => this.name = name);
    socket.fromEvent<void>('reset').subscribe(_ => {
      alert('WOOPS! Looks like you got out of sync with the server. SORRY! Log back in to continue.');
      this.name = undefined;
      this.instance = undefined;
    });
    setInterval(() => this.emit('ping', 'stay alive'), 600000);
  }

  startInstance(title, votesAllowed, owner) {
    this.socket.emit('start', { title, votesAllowed, owner });
  }

  emit(action, data) {
    this.socket.emit(action, data);
  }

  get votesLeft() {
    if (!this.instance || !this.name) {
      return 0;
    }
    return this.instance.votes[this.name];
  }
}
