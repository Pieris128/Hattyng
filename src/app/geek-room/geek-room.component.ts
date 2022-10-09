import { Component, OnDestroy, OnInit } from '@angular/core';
import { onAuthStateChanged } from 'firebase/auth';
import { Firebase } from '../firebase.service';
import { onChildAdded, onChildRemoved, ref } from 'firebase/database';

@Component({
  selector: 'app-geek-room',
  templateUrl: './geek-room.component.html',
  styleUrls: ['./geek-room.component.scss'],
})
export class GeekRoomComponent implements OnInit, OnDestroy {
  userData!: {
    displayName: string;
    username: string;
    description: string;
    nacionality: string;
    age: string;
    profile_picture: string;
  };
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

  constructor(private firebase: Firebase) {
    onChildAdded(ref(this.firebase.database, 'rooms/geek/users'), () => {
      this.getRoomList();
    });
    onChildRemoved(ref(this.firebase.database, 'rooms/geek/users'), () => {
      this.getRoomList();
    });
  }

  ngOnInit(): void {
    this.setUsersList();
  }

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
      }
      console.log('auth changed');
    });
  }
}
