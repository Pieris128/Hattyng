import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { onAuthStateChanged } from 'firebase/auth';
import { Firebase } from '../firebase.service';
import {
  limitToLast,
  off,
  onChildAdded,
  onChildRemoved,
  onValue,
  query,
  ref,
} from 'firebase/database';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-room',
  templateUrl: './global-room.component.html',
  styleUrls: ['./global-room.component.scss'],
})
export class GlobalRoomComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('msgDiv') msgDiv!: QueryList<ElementRef>;
  focusSub!: Subscription;
  // GENERAL USER DATA RETRIEVED FROM DB
  userData!: {
    displayName: string;
    username: string;
    description: string;
    nacionality: string;
    age: string;
    profile_picture: string;
  };

  // USERS ON DB OBJS
  user: { name: string; img: string } = {
    name: '',
    img: '',
  };
  totalUsers!: {
    [name: string]: {
      name: string;
      img: string;
    };
  };
  usersNames!: string[];

  // MSGS OBJs
  msgs!: {
    [id: string]: {
      name: string;
      msg: string;
      side: string;
    };
  };
  msgsIDs!: string[];

  //TextArea El
  textArea!: HTMLTextAreaElement;
  nameRed: boolean = false;
  nameBlue: boolean = false;
  namePurple: boolean = false;
  nameGreen: boolean = false;
  nameOrange: boolean = false;

  constructor(private firebase: Firebase) {
    // USERS ON ROOM READING
    onChildAdded(ref(this.firebase.database, 'rooms/global/users'), () => {
      this.getRoomList();
    });
    onChildRemoved(ref(this.firebase.database, 'rooms/global/users'), () => {
      this.getRoomList();
    });
  }

  async submitMsg(msg: string, msgField: HTMLTextAreaElement) {
    if (msg === '') {
      return;
    }
    let newMsg = await this.firebase.pushMsg(
      'global',
      this.userData.displayName,
      msg
    );
    msgField.value = '';
    return newMsg;
  }

  ngOnInit(): void {
    this.setUsersList();
  }

  ngAfterViewInit(): void {
    this.textArea = document.querySelector('.room__chat__form__enter__input')!;
    this.focusSub = this.msgDiv.changes.subscribe(() => {
      if (this.msgDiv && this.msgDiv.last) {
        this.msgDiv.last.nativeElement.focus();
        this.textArea.focus();
      }
    });
  }

  ngOnDestroy(): void {
    this.firebase.removeRoomUsersList('global', this.user.name);
    this.focusSub.unsubscribe();
    if (this.usersNames.length === 1) {
      this.firebase.removeRoomMsgs('global');
    }
    off(
      query(ref(this.firebase.database, 'rooms/global/msgs'), limitToLast(1))
    );
    off(ref(this.firebase.database, 'rooms/global/users'));
  }

  async getRoomList() {
    this.totalUsers = await this.firebase.getRoomUsersList('global');

    this.usersNames = Object.keys(this.totalUsers);
  }

  setUsersList() {
    onAuthStateChanged(this.firebase.auth, async (user) => {
      if (user) {
        this.userData = await this.firebase.readUserData(user.displayName);
        this.user.name = this.userData.displayName;
        this.user.img = this.userData.profile_picture;

        await this.firebase.writeRoomUsersList(
          'global',
          this.user.name,
          this.user.img
        );
        this.getRoomList();
        this.initChatRoom();
        this.firebase.writeStatus('Global Room', this.userData.username);

        if (this.userData.displayName === this.usersNames[0]) {
          this.nameRed = true;
        } else if (this.userData.displayName === this.usersNames[1]) {
          this.nameBlue = true;
        } else if (this.userData.displayName === this.usersNames[2]) {
          this.namePurple = true;
        } else if (this.userData.displayName === this.usersNames[3]) {
          this.nameGreen = true;
        } else if (this.userData.displayName === this.usersNames[4]) {
          this.nameOrange = true;
        }
      }
    });
  }

  // INIT LOGIC FOR SETTING CHAT OBJS ON REALTIME
  initChatRoom() {
    let doShift = true;
    onValue(
      query(ref(this.firebase.database, 'rooms/global/msgs')),
      (snapshot) => {
        if (!snapshot.val()) {
          doShift = false;
        }
      },
      { onlyOnce: true }
    );

    onChildAdded(
      query(ref(this.firebase.database, 'rooms/global/msgs'), limitToLast(1)),
      (snapshot) => {
        let msgObject: { name: string; msg: string; side: string } =
          snapshot.toJSON() as {
            name: string;
            msg: string;
            side: 'left';
          };

        if (msgObject.name === this.userData.displayName) {
          msgObject.side = 'right';
        } else {
          msgObject.side = 'left';
        }
        if (this.msgs) {
          this.msgs[snapshot.key!] = msgObject;
        } else {
          this.msgs = { [snapshot.key!]: msgObject };
        }

        this.msgsIDs = Object.keys(this.msgs);

        if (doShift) {
          this.msgsIDs.shift();
        }
      }
    );
  }

  @HostListener('keypress', ['$event'])
  onEnterPress($event: KeyboardEvent) {
    if ($event.composedPath()[0] === this.textArea) {
      if ($event.key === 'Enter' && !$event.shiftKey) {
        $event.preventDefault();
        let form = this.textArea.closest('form');
        form?.requestSubmit();
      }
    }
  }

  @HostListener('window:beforeunload')
  onCloseWindow() {
    this.firebase.writeStatus('offline', this.userData.displayName);
    if (this.usersNames.length === 1) {
      this.firebase.removeRoomMsgs('global');
    }
  }
}
