import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, set, get, child } from 'firebase/database';
import {
  getAuth,
  createUserWithEmailAndPassword,
  Auth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

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

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.database = getDatabase(this.app);
    this.auth = getAuth();
  }

  //////////////////////////////////////////////////////////////
  /* DATABASE STUFF */

  writeUserData(
    userId: string,
    name: string,
    password: string,
    imageUrl?: string
  ) {
    set(ref(this.database, 'users/' + userId), {
      username: name,
      password: password,
      profile_picture: imageUrl || null,
    });
  }

  readUserData(userId: string) {
    get(child(ref(this.database), `users/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          return true;
        } else {
          console.log('No data available');
          return false;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /////////////////////////////////////////////////
  /* AUTH STUFF */
  async createUser(email: string, password: string) {
    let state = false;
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

  async logInUser(email: string, password: string) {
    let state = false;
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
}
