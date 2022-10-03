import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firebase } from '../firebase.service';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  profileForm!: FormGroup;

  checkBoxes!: NodeList;

  imgSelected: string = 'ONE';

  userExists = false;

  constructor(private firebase: Firebase, private router: Router) {}

  ngOnInit(): void {
    onAuthStateChanged(this.firebase.auth, (user) => {
      if (user?.displayName) {
        this.router.navigate(['home']);
      } else {
        return;
      }
    });

    this.profileForm = new FormGroup({
      username: new FormControl(null, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        Validators.pattern('^[A-Za-z0-9]+$'),
      ]),
      description: new FormControl(null, [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(72),
      ]),
      pickOne: new FormControl(null),
      pickTwo: new FormControl(null),
      pickThree: new FormControl(null),
      pickFour: new FormControl(null),
      pickFive: new FormControl(null),
      pickSix: new FormControl(null),
    });
  }

  ngAfterViewInit(): void {
    this.checkBoxes = document.querySelectorAll(
      '.settings__right__form__radiogroup__imgs__crew__pick'
    );
  }

  listenChecks(whichCheck: HTMLInputElement) {
    whichCheck.checked = true;
    this.checkBoxes.forEach((input) => {
      let box = input as HTMLInputElement;

      if (whichCheck !== box) {
        box.checked = false;
      }
    });
    let selection = whichCheck.id.toUpperCase();
    this.imgSelected = selection;
  }

  async onSubmit(username: string, description: string) {
    let canUse = await this.firebase.checkUserData(username);
    if (canUse) {
      this.userExists = true;
      return;
    } else {
      await this.firebase.setProfileAuth(username);
      await this.firebase.writeUserData(
        username,
        description,
        this.imgSelected
      );
      this.router.navigate(['home']);
    }
  }
}
