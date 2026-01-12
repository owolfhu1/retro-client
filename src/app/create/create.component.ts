import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
    setTimeout(() => this.dialog.open(CreateDialogComponent, { width: '560px', disableClose: true }));
  }

}

@Component({
  selector: 'icon-picker',
  template: `
    <div class="icon-select-wrapper">
      <h3 class="icon-select-header">Select icon for {{ data?.columnName || 'column' }}</h3>
      <mat-form-field color="accent" class="full" appearance="outline">
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
      <div class="icon-select-actions">
        <button class="full" color="accent" mat-stroked-button (click)="allIcons()">see all icons</button>
        <button class="full" color="warn" mat-stroked-button (click)="dialogRef.close()">clear</button>
      </div>
    </div>
  `,
  styles: [`
    .full { width: 100%; }
    .icon-select-header {
      margin: 0 0 8px;
      text-align: center;
      color: ghostwhite;
    }
    button {
      margin-bottom: 4px;
    }
    .icon-select-wrapper {
      padding: 12px 16px 10px;
    }
    .icon-select-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .icon-select-wrapper::ng-deep .mat-mdc-form-field-infix {
      padding-top: 12px;
      padding-bottom: 10px;
    }
    .icon-select-wrapper::ng-deep .mat-mdc-form-field {
      line-height: 1.3;
    }
  `],
})
export class IconPickerDialogComponent implements OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  iconCtrl = new FormControl();
  iconFilterCtrl = new FormControl();
  filteredIconStrings: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  iconStrings = ICON_STRINGS;

  constructor(
    public dialogRef: MatDialogRef<IconPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { columnName?: string },
  ) {
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
    const columnName = this.columns[index]?.text || `column ${index + 1}`;
    this.dialog.open(IconPickerDialogComponent, {
      width: '330px',
      data: { columnName },
    }).afterClosed()
      .pipe(takeUntil(this.destroy$)).subscribe(icon => {
        this.columns[index].icon = icon;
      });
  }

  copy() {
    navigator.permissions.query({name: 'clipboard-write'} as any).then(result => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.clipboard.writeText(this.url).then(() => {
          alert(this.url + ' copied');
        });
      }
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
