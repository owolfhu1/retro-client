import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { takeUntil } from 'rxjs/operators';
import {ReplaySubject, Subject} from 'rxjs';
import { ICON_STRINGS } from '../icons.constant';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-create',
  template: '',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => this.dialog.open(CreateDialogComponent, { width: '540px', disableClose: true }));
  }

}

@Component({
  selector: 'icon-picker',
  template: `
    <mat-form-field>
      <mat-label>icon select</mat-label>
      <mat-select [formControl]="iconCtrl" >
        <mat-option>
          <ngx-mat-select-search [formControl]="iconFilterCtrl" placeholderLabel="icon filter"></ngx-mat-select-search>
        </mat-option>

        <mat-option *ngFor="let iconString of filteredIconStrings | async" [value]="iconString">
            <mat-icon>{{ iconString }}</mat-icon>{{ iconString }}
        </mat-option>
      </mat-select>
    </mat-form-field>
    <p [style.text-align]="'center'"><button color="primary" mat-raised-button (click)="allIcons()">full list of icons</button></p>
    <p [style.text-align]="'center'"><button color="accent" mat-raised-button (click)="random()">randomize</button></p>
    <p [style.text-align]="'center'"><button color="warn" mat-raised-button (click)="dialogRef.close()">clear</button></p>
  `,
})
export class IconPickerDialogComponent implements OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  iconCtrl = new FormControl();
  iconFilterCtrl = new FormControl();
  filteredIconStrings: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  iconStrings = ICON_STRINGS;

  constructor(public dialogRef: MatDialogRef<IconPickerDialogComponent>) {
    this.filteredIconStrings.next(this.iconStrings.slice());
    this.iconFilterCtrl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(search => {
        this.filteredIconStrings.next(
          this.iconStrings.filter(str => str.toLowerCase().indexOf(search) > -1)
        );
      });
    this.iconCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.dialogRef.close(value);
      }
    });
  }

  random() {
    this.dialogRef.close(ICON_STRINGS[Math.floor(Math.random() * ICON_STRINGS.length)]);
  }

  allIcons() {
    window.open('https://material.io/resources/icons/?style=baseline', '_blank');
  }

  get icon() {
    return this.iconCtrl.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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
    private socketService: SocketService,
    private dialog: MatDialog,
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
    { text: 'likes', color: 'green', icon: 'sentiment_very_satisfied' },
    { text: 'dislikes', color: 'darkred', icon: 'sentiment_very_dissatisfied' },
    { text: 'needs', color: 'purple', icon: 'flag' },
  ];

  setIcon(index) {
    this.dialog.open(IconPickerDialogComponent).afterClosed().pipe(takeUntil(this.destroy$)).subscribe(icon => {
      this.columns[index].icon = icon;
    });
  }

  copy() {
    navigator.clipboard.writeText(this.url).then(res => {
      alert(this.url + ' copied');
    });
  }

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
    const title = (this.title || '').replaceAll(' ', '').replaceAll('?', '').replaceAll('/', '').replaceAll('=', '');
    const owner = (this.owner || '').replaceAll(' ', '');

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

  get url(): string {
    const title = (this.title || '').replaceAll(' ', '').replaceAll('?', '').replaceAll('/', '').replaceAll('=', '');
    const prefix = window.location.href.replace('create', 'instance/');
    return prefix + title;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
