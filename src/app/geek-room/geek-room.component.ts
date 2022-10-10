import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-geek-room',
  templateUrl: './geek-room.component.html',
  styleUrls: ['./geek-room.component.scss'],
})
export class GeekRoomComponent implements OnInit, OnDestroy, AfterViewInit {
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

  constructor(private firebase: Firebase) {
    // USERS ON ROOM READING
    onChildAdded(ref(this.firebase.database, 'rooms/geek/users'), () => {
      this.getRoomList();
    });
    onChildRemoved(ref(this.firebase.database, 'rooms/geek/users'), () => {
      this.getRoomList();
    });
  }

  async submitMsg(msg: string, msgField: HTMLInputElement) {
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

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.firebase.removeRoomUsersList('geek', this.user.name);
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
      }

      if (this.msgs) {
        this.msgs[snapshot.key!] = msgObject;
      } else {
        this.msgs = { [snapshot.key!]: msgObject };
      }

      this.msgsIDs = Object.keys(this.msgs);
      this.msgsIDs.shift();
    });
  }
}
