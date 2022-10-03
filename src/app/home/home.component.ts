import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Firebase } from '../firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  linkHome!: HTMLHeadingElement;
  linkRoom!: HTMLHeadingElement;
  linkProfile!: HTMLHeadingElement;
  linkSettings!: HTMLHeadElement;

  displayHome: boolean = true;
  displayRooms: boolean = false;
  displayProfile: boolean = false;
  displaySettings: boolean = false;

  dBUser!: string | null;

  userData!: {
    username: string;
    description: string;
    profile_picture: string;
  };
  userName: string = '';
  userDesc: string = '';
  userImgNum: string = '';
  userImgSrc!: string;

  searchForm!: FormGroup;
  inputError: boolean = false;

  constructor(private firebase: Firebase) {}
  //Builds form for searching other users!
  ngOnInit(): void {
    this.searchForm = new FormGroup({
      searchInput: new FormControl(null, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        Validators.pattern('^[A-Za-z0-9]+$'),
      ]),
    });
  }
  //Refer to DOM Elements
  ngAfterViewInit(): void {
    this.linkHome = document.querySelector('.home__nav__links__home')!;
    this.linkRoom = document.querySelector('.home__nav__links__chats')!;
    this.linkProfile = document.querySelector('.home__nav__links__profile')!;
    this.linkSettings = document.querySelector('.home__nav__links__settings')!;
    this.setUserData();
  }
  //Move between sections!
  linkClicked(clicked: string) {
    let selected = clicked.toUpperCase().trim();
    if (selected === 'HOME') {
      this.linkHome.classList.add('active-link');
      this.linkRoom.classList.remove('active-link');
      this.linkProfile.classList.remove('active-link');
      this.linkSettings.classList.remove('active-link');
      this.displayHome = true;
      this.displayProfile = false;
      this.displayRooms = false;
      this.displaySettings = false;
    } else if (selected === 'ROOMS') {
      this.linkRoom.classList.add('active-link');
      this.linkHome.classList.remove('active-link');
      this.linkProfile.classList.remove('active-link');
      this.linkSettings.classList.remove('active-link');
      this.displayRooms = true;
      this.displayProfile = false;
      this.displayHome = false;
      this.displaySettings = false;
    } else if (selected === 'PROFILE') {
      this.linkProfile.classList.add('active-link');
      this.linkHome.classList.remove('active-link');
      this.linkRoom.classList.remove('active-link');
      this.linkSettings.classList.remove('active-link');
      this.displayProfile = true;
      this.displayHome = false;
      this.displayRooms = false;
      this.displaySettings = false;
    } else if (selected === 'SETTINGS') {
      this.linkSettings.classList.add('active-link');
      this.linkHome.classList.remove('active-link');
      this.linkRoom.classList.remove('active-link');
      this.linkProfile.classList.remove('active-link');
      this.displayProfile = false;
      this.displayHome = false;
      this.displayRooms = false;
      this.displaySettings = true;
    }
  }

  //Profile functionality!
  async setUserData() {
    await this.getUserName();
    this.userData = await this.firebase.readUserData(this.dBUser);
    console.log(this.userData);
    this.userName = this.userData.username;
    this.userDesc = this.userData.description;
    this.userImgNum = this.userData.profile_picture;

    switch (this.userImgNum) {
      case 'ONE':
        this.userImgSrc = 'profileOne';
        break;
      case 'TWO':
        this.userImgSrc = 'profileTwo';
        break;
      case 'THREE':
        this.userImgSrc = 'profileThree';
        break;
      case 'FOUR':
        this.userImgSrc = 'profileFour';
        break;
      case 'FIVE':
        this.userImgSrc = 'profileFive';
        break;
      case 'SIX':
        this.userImgSrc = 'profileSix';
        break;
      default:
        this.userImgSrc = 'profileOne';
    }
  }

  async getUserName() {
    this.dBUser = this.firebase.getUser();
  }
  //Profile search others users functionality!
  async searchUser(username: string, element: HTMLInputElement) {
    //Looks in the database for a user that match the input value
    this.userData = await this.firebase.readUserData(username);
    //If not match
    if (this.userData.username === '') {
      this.inputError = true;
      element.value = '';
      element.classList.add('ng-invalid');
      element.classList.add('ng-touched');

      await this.getUserName();
      this.userData = await this.firebase.readUserData(this.dBUser);
      this.userName = this.userData.username;
      this.userDesc = this.userData.description;
      this.userImgNum = this.userData.profile_picture;

      switch (this.userImgNum) {
        case 'ONE':
          this.userImgSrc = 'profileOne';
          break;
        case 'TWO':
          this.userImgSrc = 'profileTwo';
          break;
        case 'THREE':
          this.userImgSrc = 'profileThree';
          break;
        case 'FOUR':
          this.userImgSrc = 'profileFour';
          break;
        case 'FIVE':
          this.userImgSrc = 'profileFive';
          break;
        case 'SIX':
          this.userImgSrc = 'profileSix';
          break;
        default:
          this.userImgSrc = 'profileOne';
      }

      return;
    }
    //If found some match!
    this.userName = this.userData.username;
    this.userDesc = this.userData.description;
    this.userImgNum = this.userData.profile_picture;

    switch (this.userImgNum) {
      case 'ONE':
        this.userImgSrc = 'profileOne';
        break;
      case 'TWO':
        this.userImgSrc = 'profileTwo';
        break;
      case 'THREE':
        this.userImgSrc = 'profileThree';
        break;
      case 'FOUR':
        this.userImgSrc = 'profileFour';
        break;
      case 'FIVE':
        this.userImgSrc = 'profileFive';
        break;
      case 'SIX':
        this.userImgSrc = 'profileSix';
        break;
      default:
        this.userImgSrc = 'profileOne';
    }

    this.inputError = false;
  }
}
