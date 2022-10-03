import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, set, get, child } from 'firebase/database';
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
} from 'firebase/auth';
import { Router } from '@angular/router';

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
    imageUrl?: string
  ) {
    await set(ref(this.database, 'users/' + username), {
      username: username,
      profile_picture: imageUrl || null,
      description: description,
    });
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
      description: '',
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
        console.log(userCredential, user);
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
}
