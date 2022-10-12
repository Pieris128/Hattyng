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
  endAt,
  limitToLast,
  onChildAdded,
  onChildRemoved,
  query,
  ref,
  onValue,
  startAt,
  QueryConstraint,
} from 'firebase/database';
import { retryWhen, Subscription } from 'rxjs';

@Component({
  selector: 'app-geek-room',
  templateUrl: './geek-room.component.html',
  styleUrls: ['./geek-room.component.scss'],
})
export class GeekRoomComponent implements OnInit, OnDestroy, AfterViewInit {
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
  msgsNum: number = 0;
  //TextArea El
  textArea!: HTMLTextAreaElement;

  constructor(private firebase: Firebase) {
    // USERS ON ROOM READING
    onChildAdded(ref(this.firebase.database, 'rooms/geek/users'), () => {
      this.getRoomList();
    });
    onChildRemoved(ref(this.firebase.database, 'rooms/geek/users'), () => {
      this.getRoomList();
    });
  }

  async submitMsg(msg: string, msgField: HTMLTextAreaElement) {
    if (msg === '') {
      return;
    }
    let newMsg = await this.firebase.pushMsg(
      'geek',
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
    this.textArea = document.querySelector('.room__chat__enter__input')!;
    this.focusSub = this.msgDiv.changes.subscribe(() => {
      if (this.msgDiv && this.msgDiv.last) {
        this.msgDiv.last.nativeElement.focus();
        this.textArea.focus();
      }
    });
  }

  ngOnDestroy(): void {
    this.firebase.removeRoomUsersList('geek', this.user.name);
    this.focusSub.unsubscribe();
    if (this.usersNames.length === 1) {
      this.firebase.removeRoomMsgs('geek');
    }
  }

  async getRoomList() {
    this.totalUsers = await this.firebase.getRoomUsersList('geek');

    this.usersNames = Object.keys(this.totalUsers);
  }

  setUsersList() {
    onAuthStateChanged(this.firebase.auth, async (user) => {
      if (user) {
        this.userData = await this.firebase.readUserData(user.displayName);
        this.user.name = this.userData.displayName;
        this.user.img = this.userData.profile_picture;

        await this.firebase.writeRoomUsersList(
          'geek',
          this.user.name,
          this.user.img
        );
        this.getRoomList();
        this.initChatRoom();
      }
    });
  }

  // INIT LOGIC FOR SETTING CHAT OBJS ON REALTIME
  initChatRoom() {
    // MSG FROM DB READING LOGIC
    let newMsgsQuery = query(
      ref(this.firebase.database, 'rooms/geek/msgs'),
      limitToLast(1)
    );

    onChildAdded(newMsgsQuery, (snapshot) => {
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
    });
  }

  @HostListener('keypress', ['$event'])
  onEnterPress($event: KeyboardEvent) {
    console.log($event);
    if ($event.composedPath()[0] === this.textArea) {
      if ($event.key === 'Enter' && !$event.shiftKey) {
        $event.preventDefault();
        let form = this.textArea.closest('form');
        this.textArea.closest('form')?.requestSubmit();
      }
    }
  }
}
