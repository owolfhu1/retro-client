import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-create',
  template: '',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => this.dialog.open(CreateDialogComponent, { width: '370px', disableClose: true }));
  }

}

@Component({
  selector: 'create-dialog',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateDialogComponent implements OnDestroy {

  constructor(
    public dialogRef: MatDialogRef<CreateDialogComponent>,
    private router: Router,
    private socketService: SocketService
  ) {
    socketService.goToInstance
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.socketService.name = data.name;
        this.socketService.instance = data.instance;
        this.dialogRef.close();
        router.navigate(['/instance', data.instance.title ]);
      });
  }
  likesAllowed = 20;
  negativeVotesAllowed = true;
  emojiAllowed = true;
  title;
  owner;
  destroy$: Subject<boolean> = new Subject<boolean>();

  colors = [
    'green',
    'blue',
    'purple',
    'darkred',
    'orangered',
    'yellowgreen',
    'deeppink',
    'gray',
  ];

  columns = [
    { text: 'went well', color: 'green' },
    { text: 'not well', color: 'darkred' },
    { text: 'action items', color: 'orangered' },
  ];

  border(main) {
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

  drop(event) {
    this.columns.splice(event.currentIndex, 0, this.columns.splice(event.previousIndex, 1)[0]);
  }

  del(index) {
    this.columns.splice(index, 1);
  }

  setColor(color, index) {
    this.columns[index].color = color;
  }

  start() {
    const title = (this.title || '').replace(' ', '').replace('?', '').replace('/', '').replace('=', '');
    const owner = (this.owner || '').replace(' ', '');

    Array.from(document.getElementsByClassName('col-input'))
      .forEach((input, index) => this.columns[index].text = input['value']);

    const textOnly = this.columns.map(item => item.text);
    if ((new Set(textOnly)).size !== textOnly.length) {
      this.socketService.systemMessage.next('please give columns unique names');
    } else if (owner && title && this.likesAllowed > -1 && this.columns.filter(col => !col.text).length === 0) {
      this.socketService.startInstance(title, this.likesAllowed, this.negativeVotesAllowed, owner, this.emojiAllowed, this.columns);
    } else {
      this.socketService.systemMessage.next('please fill in all fields');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
