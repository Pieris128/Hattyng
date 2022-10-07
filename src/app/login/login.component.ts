import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firebase } from '../firebase.service';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  logged: boolean = false;
  loginForm!: FormGroup;
  inputUser!: HTMLElement;
  inputPwd!: HTMLElement;

  constructor(private firebase: Firebase, private router: Router) {}

  async verifyLogIn(email: string, password: string) {
    let state = this.firebase.logInUser(email, password);
    if (await state) {
      this.logged = true;
    }
  }

  ngAfterViewInit(): void {
    this.inputUser = document.getElementById('email')!;
    this.inputPwd = document.getElementById('password')!;
  }

  ngOnInit(): void {
    onAuthStateChanged(this.firebase.auth, (user) => {
      if (user) {
        this.router.navigate(['home']);
      } else {
        return;
      }
    });

    this.loginForm = new FormGroup({
      useremail: new FormControl(null, [Validators.required, Validators.email]),
      userpassword: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  async onSubmit(email: string, password: string) {
    this.inputPwd.classList.remove('credentials-error');
    this.inputUser.classList.remove('credentials-error');
    await this.verifyLogIn(email, password);
    if (!this.logged) {
      this.inputPwd.classList.add('credentials-error');
      this.inputUser.classList.add('credentials-error');
      return;
    } else {
      this.router.navigate(['home']);
    }
  }

  createAcc() {
    this.router.navigate(['signup']);
  }

  switchVisibility() {
    let input = document.querySelector('.pwdInput');
    let icon = document.querySelector('.pwdIcon');
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
}
