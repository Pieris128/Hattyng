import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Firebase } from '../firebase.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { every } from 'rxjs';

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
  //Display of each section
  displayHome: boolean = true;
  displayRooms: boolean = false;
  displayProfile: boolean = false;
  displaySettings: boolean = false;
  //User data
  userData!: {
    displayName: string;
    age: string;
    nacionality: string;
    username: string;
    description: string;
    profile_picture: string;
  };
  userName: string = '';
  userDesc: string = '';
  userImgNum: string = '';
  userImgSrc!: string;
  userNacion: string = '';
  userAge: string = '';
  userJoined: string = '';
  //Search another users
  searchForm!: FormGroup;
  inputError: boolean = false;
  //Settings features
  checkBoxes!: NodeList;
  imgSelected!: string;
  userExists: boolean = false;
  settingForm!: FormGroup;
  showModal: boolean = false;
  showModalUserDelete: boolean = false;
  settingFormInputs!: NodeListOf<Element>;
  settingsInputsTouched: boolean = false;

  constructor(private firebase: Firebase, private router: Router) {}

  //Builds form for searching other users!
  ngOnInit(): void {
    onAuthStateChanged(this.firebase.auth, (user) => {
      if (user) {
        return;
      } else {
        this.router.navigate(['login']);
      }
    });

    this.searchForm = new FormGroup({
      searchInput: new FormControl(null, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
        Validators.pattern('^[A-Za-z0-9]+$'),
      ]),
    });

    this.setUserData();

    ////////////////////////////////////////////
    // Form for SETTINGS section
    this.settingForm = new FormGroup({
      username: new FormControl(null, [
        Validators.minLength(4),
        Validators.maxLength(12),
        Validators.pattern('^[A-Za-z0-9]+$'),
      ]),
      password: new FormControl(null, Validators.minLength(6)),
      age: new FormControl(null, [
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern('^[0-9]*$'),
      ]),
      nacionality: new FormControl(null, [
        Validators.minLength(1),
        Validators.maxLength(58),
      ]),
      description: new FormControl(null, [
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

  //Refer to DOM Elements
  ngAfterViewInit(): void {
    this.linkHome = document.querySelector('.home__nav__links__home')!;
    this.linkRoom = document.querySelector('.home__nav__links__chats')!;
    this.linkProfile = document.querySelector('.home__nav__links__profile')!;
    this.linkSettings = document.querySelector('.home__nav__links__settings')!;
  }
  /////////////////////////////////////
  //Move between sections!
  linkClicked(clicked: string) {
    let selected = clicked.toUpperCase().trim();

    if (selected !== 'SETTINGS') {
      this.imgSelected = '';
    }
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

  /////////////////////////////////////////
  //Profile functionality!
  setUserData() {
    onAuthStateChanged(this.firebase.auth, async (user) => {
      if (user) {
        this.userData = await this.firebase.readUserData(user.displayName);
        this.userName = this.userData.displayName;
        this.userDesc = this.userData.description;
        this.userNacion = this.userData.nacionality;
        this.userAge = this.userData.age;
        this.userImgNum = this.userData.profile_picture;
        let firstSlice = user.metadata.creationTime!;

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

        this.userJoined = firstSlice.slice(5, 17);

        this.setFormValues();
      } else {
        return;
      }
    });
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

      this.setUserData();

      return;
    }
    //If found some match!
    this.userName = this.userData.username;
    this.userDesc = this.userData.description;
    this.userNacion = this.userData.nacionality;
    this.userAge = this.userData.age;
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

  ///////////////////////////////////////////
  //Sign Out Functionality!
  signOut() {
    this.firebase.signOut();
  }

  ////////////////////////////////////////////////////
  // Profile Image selection functionality for Settings section
  listenChecks(whichCheck: HTMLInputElement) {
    this.checkBoxes = document.querySelectorAll(
      '.home__settings__form__radiogroup__imgs__crew__pick'
    );
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

  // Default values of Settings formulary
  setFormValues() {
    this.settingForm.controls['username'].setValue(this.userData.displayName);
    this.settingForm.controls['age'].setValue(this.userData.age);
    this.settingForm.controls['nacionality'].setValue(
      this.userData.nacionality
    );
    this.settingForm.controls['description'].setValue(
      this.userData.description
    );

    this.settingForm.controls['username'].disable();
    this.settingForm.controls['password'].disable();
    this.settingForm.controls['age'].disable();
    this.settingForm.controls['nacionality'].disable();
    this.settingForm.controls['description'].disable();
  }

  // Activate Settings Inputs for change personal data on db
  modifyInput(id: string, element: HTMLInputElement | HTMLTextAreaElement) {
    /////////////////////////////////////
    // Settings Password View State Logic
    let gearIcon = document.getElementById('settingsPasswordIcon');

    if (gearIcon?.classList.contains('onActivePasswordInputToVisible')) {
      this.onPasswordView('main');
      return;
    } else if (gearIcon?.classList.contains('onActivePasswordInputToHidden')) {
      this.onPasswordView('mainAndHidden');
      return;
    }

    /////////////////////////////////////
    //Settings icon set active state
    element.nextElementSibling?.classList.add('inputActiveState');
    //
    if (id === 'username') {
      if (!element.classList.contains('modifying')) {
        this.settingForm.controls['username'].enable();
        this.settingForm.controls['username'].setValidators(
          Validators.required
        );
        element.classList.add('modifying');
      } else {
        this.settingForm.controls['username'].disable();
        this.settingForm.controls['username'].removeValidators(
          Validators.required
        );
        element.classList.remove('modifying');
        //Settings icon remove active state
        element.nextElementSibling?.classList.remove('inputActiveState');
      }
    }
    if (id === 'password') {
      if (!element.classList.contains('modifying')) {
        this.settingForm.controls['password'].enable();
        this.settingForm.controls['password'].setValidators(
          Validators.required
        );
        element.classList.add('modifying');
        this.showModal = true;
      } else {
        this.settingForm.controls['password'].disable();
        this.settingForm.controls['password'].removeValidators(
          Validators.required
        );
        element.classList.remove('modifying');
        element.nextElementSibling?.classList.remove('inputActiveState');
      }
    }
    if (id === 'age') {
      if (!element.classList.contains('modifying')) {
        this.settingForm.controls['age'].enable();
        this.settingForm.controls['age'].setValidators(Validators.required);
        element.classList.add('modifying');
      } else {
        this.settingForm.controls['age'].disable();
        this.settingForm.controls['age'].removeValidators(Validators.required);
        element.classList.remove('modifying');
        element.nextElementSibling?.classList.remove('inputActiveState');
      }
    }
    if (id === 'nacionality') {
      if (!element.classList.contains('modifying')) {
        this.settingForm.controls['nacionality'].enable();
        this.settingForm.controls['nacionality'].setValidators(
          Validators.required
        );
        element.classList.add('modifying');
      } else {
        this.settingForm.controls['nacionality'].disable();
        this.settingForm.controls['nacionality'].removeValidators(
          Validators.required
        );
        element.classList.remove('modifying');
        element.nextElementSibling?.classList.remove('inputActiveState');
      }
    }
    if (id === 'description') {
      if (!element.classList.contains('modifying')) {
        this.settingForm.controls['description'].enable();
        this.settingForm.controls['description'].setValidators(
          Validators.required
        );
        element.classList.add('modifying');
      } else {
        this.settingForm.controls['description'].disable();
        this.settingForm.controls['description'].removeValidators(
          Validators.required
        );
        element.classList.remove('modifying');
        element.nextElementSibling?.classList.remove('inputActiveState');
      }
    }
  }

  //////////////////////////////////////
  // Update Profile data on submit Functionality
  async updateProfileData(
    name?: string | null,
    password?: string | null,
    age?: string | null,
    nacionality?: string | null,
    description?: string | null
  ) {
    ///////////////////////////////////////
    // DISABLE FORM PRIMITIVE FUNCTIONALITY
    this.settingFormInputs = document.querySelectorAll(
      '.home__settings__form__group__input'
    );
    this.settingsInputsTouched = false;
    this.settingFormInputs.forEach((input) => {
      let inputElement = input as HTMLInputElement;
      if (inputElement.classList.contains('ng-touched') || this.imgSelected) {
        this.settingsInputsTouched = true;
      }
    });
    if (!this.settingsInputsTouched) {
      return;
    }
    ////////////////////////////////////////

    if (this.imgSelected === '' || this.imgSelected === null) {
      this.imgSelected = this.userData.profile_picture;
    }
    let image = this.imgSelected;

    await this.firebase.updateUserData(
      this.userData.username,
      name,
      password,
      age,
      nacionality,
      description,
      image
    );

    // Change Password
    if (password && password !== '') {
      this.firebase.changePassword(password);
    }

    // Remove visual classes from settings form active state
    document
      .querySelectorAll('.home__settings__form__group__input')
      .forEach((el) => {
        el.nextElementSibling?.classList.remove('inputActiveState');
        el.classList.remove('modifying');
      });

    // Empty password input on submit
    let passwordInput = document.querySelector(
      '.passwordInput'
    ) as HTMLInputElement;
    passwordInput.value = '';

    // Deselect img icon
    if (this.checkBoxes)
      this.checkBoxes.forEach((el) => {
        let radioButton = el as HTMLInputElement;
        radioButton.checked = false;
      });

    // Show saved status span
    let span = document.querySelector('.home__settings__form__bottom__save');
    span?.classList.add('showSpan');
    setTimeout(() => {
      span?.classList.remove('showSpan');
    }, 4000);

    this.setUserData();
  }

  async onSubmitModal(actualPassword: string) {
    let errorSpan = document.querySelector('.password__modal__form__error');
    let worked = await this.firebase.reAuthenticate(actualPassword);
    if (worked) {
      this.showModal = false;
      errorSpan?.classList.remove('showSpan');
    } else {
      errorSpan?.classList.add('showSpan');
    }
  }

  onModalOpen(e: Event) {
    if (
      (e.composedPath()[0] as HTMLElement).classList.contains('password__modal')
    ) {
      this.showModal = !this.showModal;
      this.settingForm.controls['password'].disable();
      document
        .getElementById('settingsPasswordIcon')
        ?.classList.remove('inputActiveState');
      document.getElementById('password')?.classList.remove('modifying');
    }
  }

  // Password Viewing logic on Settings section
  onPasswordView(calledFrom: string) {
    let gearIcon = document.getElementById('settingsPasswordIcon');
    let mainInput = document.querySelector('.passwordInput');

    if (calledFrom === 'modal') {
      let input = document.querySelector(
        '.password__modal__form__group__input'
      );
      let icon = document.querySelector('.password__modal__form__group__img');
      if (input && icon) {
        if (input.attributes.getNamedItem('type')?.value === 'password') {
          icon.attributes.getNamedItem('src')!.value = '../../assets/eye.png';
          input.attributes.getNamedItem('type')!.value = 'text';
        } else {
          icon.attributes.getNamedItem('src')!.value =
            '../../assets/eye-slash.png';
          input.attributes.getNamedItem('type')!.value = 'password';
        }
      }
    }
    if (calledFrom === 'settings') {
      if (gearIcon) {
        gearIcon.classList.add('onActivePasswordInputToVisible');
        gearIcon.attributes.getNamedItem('src')!.value =
          '../../assets/eye-slash.png';
      }
    }
    if (calledFrom === 'main') {
      gearIcon!.attributes.getNamedItem('src')!.value = '../../assets/eye.png';
      mainInput!.attributes.getNamedItem('type')!.value = 'text';
      gearIcon!.classList.remove('onActivePasswordInputToVisible');
      gearIcon!.classList.add('onActivePasswordInputToHidden');
    }
    if (calledFrom === 'mainAndHidden') {
      gearIcon!.attributes.getNamedItem('src')!.value =
        '../../assets/eye-slash.png';
      mainInput!.attributes.getNamedItem('type')!.value = 'password';
      gearIcon!.classList.remove('onActivePasswordInputToHidden');
      gearIcon!.classList.add('onActivePasswordInputToVisible');
    }
    if (calledFrom === 'onFinishedChanges') {
      gearIcon!.classList.remove('onActivePasswordInputToHidden');
      gearIcon!.classList.remove('onActivePasswordInputToVisible');
      gearIcon!.attributes.getNamedItem('src')!.value =
        '../../assets/gear-icon.png';
    }
  }

  //Open user delete modal window
  async onSubmitDelete(actualPassword: string) {
    let errorSpan = document.querySelector('.deleteError');
    let worked = await this.firebase.reAuthenticate(actualPassword);
    if (worked) {
      this.showModalUserDelete = false;
      errorSpan?.classList.remove('showSpan');
      this.firebase.deleteUser(this.userData.username);
    } else {
      errorSpan?.classList.add('showSpan');
    }
  }

  onDelteOpen(e: Event) {
    if (
      (e.composedPath()[0] as HTMLElement).classList.contains('password__modal')
    ) {
      this.showModalUserDelete = !this.showModalUserDelete;
    }
  }

  onOpenDelete() {
    this.showModalUserDelete = true;
  }
}
