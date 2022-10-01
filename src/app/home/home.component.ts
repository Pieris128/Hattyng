import { AfterViewInit, Component, OnInit } from '@angular/core';
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

  displayHome: boolean = true;
  displayRooms: boolean = false;
  displayProfile: boolean = false;

  dBUser!: string | null;
  userData: {} = {};

  constructor(private firebase: Firebase) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.linkHome = document.querySelector('.home__nav__links__home')!;
    this.linkRoom = document.querySelector('.home__nav__links__chats')!;
    this.linkProfile = document.querySelector('.home__nav__links__profile')!;
    this.dBUser = this.firebase.getUser();
    this.setUserData();
  }

  linkClicked(clicked: string) {
    let selected = clicked.toUpperCase().trim();
    if (selected === 'HOME') {
      this.linkHome.classList.add('active-link');
      this.linkRoom.classList.remove('active-link');
      this.linkProfile.classList.remove('active-link');
      this.displayHome = true;
      this.displayProfile = false;
      this.displayRooms = false;
    } else if (selected === 'ROOMS') {
      this.linkRoom.classList.add('active-link');
      this.linkHome.classList.remove('active-link');
      this.linkProfile.classList.remove('active-link');
      this.displayRooms = true;
      this.displayProfile = false;
      this.displayHome = false;
    } else if (selected === 'PROFILE') {
      this.linkProfile.classList.add('active-link');
      this.linkHome.classList.remove('active-link');
      this.linkRoom.classList.remove('active-link');
      this.displayProfile = true;
      this.displayHome = false;
      this.displayRooms = false;
    }
  }

  async setUserData() {
    this.userData = await this.firebase.readUserData(this.dBUser);
    //console.log(this.userData);
  }
}
