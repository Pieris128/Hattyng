import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  profileForm!: FormGroup;

  checkBoxes!: NodeList;

  constructor() {}

  ngOnInit(): void {
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
    console.log('Called');
    whichCheck.checked = true;
    console.log(whichCheck.checked);
    this.checkBoxes.forEach((input) => {
      let box = input as HTMLInputElement;

      if (whichCheck !== box) {
        box.checked = false;
      }
    });
  }
}
