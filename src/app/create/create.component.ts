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
  likesAllowed = 10;
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
    if (this.owner && this.title) {
      this.socketService.startInstance(this.title, this.likesAllowed, this.owner);
    } else {
      alert('please fill in all fields');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
