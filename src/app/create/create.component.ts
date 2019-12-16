import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {SocketService} from '../socket.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-create',
  template: '',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => this.dialog.open(CreateDialogComponent, { width: '230px', disableClose: true }));
  }

}

@Component({
  selector: 'create-dialog',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateDialogComponent implements OnDestroy {
  likesAllowed = 20;
  title;
  owner;
  destroy$: Subject<boolean> = new Subject<boolean>();

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

  start() {
    let title = this.title.replace(' ', '');
    title = title.replace('?', '');
    title = title.replace('/', '');
    title = title.replace('=', '');
    const owner = this.owner.replace(' ', '');
    if (owner && title && this.likesAllowed > -1) {
      this.socketService.startInstance(title, this.likesAllowed, owner);
    } else {
      alert('please fill in all fields with letters');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
