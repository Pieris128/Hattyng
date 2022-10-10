import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  set,
  get,
  child,
  update,
  push,
  remove,
  onChildAdded,
} from 'firebase/database';
import {
  getAuth,
  createUserWithEmailAndPassword,
  Auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  NextOrObserver,
  setPersistence,
  browserSessionPersistence,
  updateProfile,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  UserCredential,
  deleteUser,
} from 'firebase/auth';
import { Router } from '@angular/router';
import { flattenJSON } from 'three/src/animation/AnimationUtils';

const firebaseConfig = {
  apiKey: 'AIzaSyDMqCr1TXMPGCFFTsWfi0haY6jjPLDhuY0',
  authDomain: 'hattyng-angular-app.firebaseapp.com',
  databaseURL: 'https://hattyng-angular-app-default-rtdb.firebaseio.com',
  projectId: 'hattyng-angular-app',
  storageBucket: 'hattyng-angular-app.appspot.com',
  messagingSenderId: '400552558672',
  appId: '1:400552558672:web:b6b75d9a3bc333ce809155',
};

@Injectable({ providedIn: 'root' })
export class Firebase {
  app: FirebaseApp;
  database: Database;
  auth: Auth;
  authState: NextOrObserver<string>;
  static setProfileAuth: any;

  userOriginalName!: string;

  constructor(private router: Router) {
    this.app = initializeApp(firebaseConfig);
    this.database = getDatabase(this.app);
    this.auth = getAuth();
    this.authState = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // ...
      } else {
        // User is signed out
        // ...
        console.log('Is not auth!');
      }
    });
  }

  //////////////////////////////////////////////////////////////
  /* DATABASE STUFF */
  //Write functionallity
  async writeUserData(
    username: string,
    description: string,
    nacionality: string,
    age: string,
    imageUrl?: string
  ) {
    await set(ref(this.database, 'users/' + username), {
      username: username,
      displayName: username,
      profile_picture: imageUrl || null,
      description: description,
      nacionality: nacionality,
      age: age,
    });
  }
  //Write rooms users list
  async writeRoomUsersList(room: string, username: string, userimg: string) {
    switch (userimg) {
      case 'ONE':
        userimg = 'profileOne';
        break;
      case 'TWO':
        userimg = 'profileTwo';
        break;
      case 'THREE':
        userimg = 'profileThree';
        break;
      case 'FOUR':
        userimg = 'profileFour';
        break;
      case 'FIVE':
        userimg = 'profileFive';
        break;
      case 'SIX':
        userimg = 'profileSix';
        break;
      default:
        userimg = 'profileOne';
    }

    await set(ref(this.database, `rooms/${room}/users/${username}`), {
      name: username,
      img: userimg,
    });
  }

  // Write room Messages on DB
  async writeRoomWelcomeMsg(room: string) {
    await set(ref(this.database, `rooms/${room}/chat/msgs/`), {
      name: 'Hattyng',
      msg: 'Welcome to the geek room. Start hattyng now!',
    });
  }

  //Remove rooms user list
  async removeRoomUsersList(room: string, username: string) {
    await remove(ref(this.database, `rooms/${room}/users/${username}`));
  }
  //Check if another username exists in Set Profile.
  async checkUserData(name: string) {
    let canUse: boolean = false;

    await get(child(ref(this.database), `users/${name}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          canUse = true;
          return true;
        } else {
          canUse = false;
          return false;
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return canUse;
  }
  //Display user data in profile section!
  async readUserData(name: string | null) {
    let userData = {
      username: '',
      displayName: '',
      description: '',
      nacionality: '',
      age: '',
      profile_picture: '',
    };
    await get(child(ref(this.database), `users/${name}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          userData = snapshot.val();
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return userData;
  }
  //Get users list for rooms
  async getRoomUsersList(room: string) {
    let userList: {} = {};

    await get(child(ref(this.database), `rooms/${room}/users`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          userList = snapshot.val();
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return userList;
  }
  // Update user data
  async updateUserData(
    username: string,
    name?: string | null,
    password?: string | null,
    age?: string | null,
    nacionality?: string | null,
    description?: string | null,
    profile_picture?: string | null
  ) {
    // Format data
    let postData: {
      displayName?: string;
      age?: string;
      nacionality?: string;
      description?: string;
      profile_picture?: string;
    } = {};

    if (name && name !== '') {
      postData.displayName = name;
    }
    if (age && age !== '') {
      postData.age = age;
    }
    if (nacionality && nacionality !== '') {
      postData.nacionality = nacionality;
    }
    if (description && description !== '') {
      postData.description = description;
    }
    if (profile_picture && profile_picture !== '') {
      postData.profile_picture = profile_picture;
    } else {
      postData.profile_picture = 'ONE';
    }

    // Write the new post's data simultaneously in the posts list and the user's post list.

    return update(ref(this.database, `users/${username}`), postData);
  }
  /////////////////////////////////////////////////
  /* AUTH STUFF */
  //Sign Up Functionality
  async createUser(email: string, password: string) {
    let state = false;

    await setPersistence(this.auth, browserSessionPersistence);

    await createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        state = true;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
    return state;
  }
  //Login Functionality
  async logInUser(email: string, password: string) {
    console.log(this.auth);
    let state = false;

    await setPersistence(this.auth, browserSessionPersistence);
    await signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        state = true;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    return state;
  }

  //Set User Auth Properties Functionality
  async setProfileAuth(username: string) {
    if (!this.auth.currentUser) {
      return;
    }

    await updateProfile(this.auth.currentUser, {
      displayName: username,
    }).catch((error) => {
      console.error(error.message);
    });
  }

  // Change Password Functionality
  reAuthenticate(actualPassword: string) {
    if (this.auth.currentUser?.email && this.auth.currentUser) {
      let credentials = EmailAuthProvider.credential(
        this.auth.currentUser?.email,
        actualPassword
      );
      let state = reauthenticateWithCredential(
        this.auth.currentUser,
        credentials
      )
        .then(() => {
          return true;
        })
        .catch(() => {
          return false;
        });
      return state;
    }
    return false;
  }

  changePassword(password: string) {
    if (this.auth.currentUser) updatePassword(this.auth.currentUser, password);
  }

  //Logout functionality
  signOut() {
    signOut(this.auth)
      .then(() => {
        console.log('Signed out!');
      })
      .catch((e) => {
        console.log('Error', e);
      });
  }

  ////////////////////////////////////////////////
  //DATABASE && AUTH
  async deleteUser(username: string) {
    await remove(ref(this.database, `users/${username}`));
    await deleteUser(this.auth.currentUser!)
      .then(() => {
        console.log('Deleted!');
      })
      .catch((e) => {
        console.log(e.message);
      });
  }
}
