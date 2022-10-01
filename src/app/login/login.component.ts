import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firebase } from '../firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  logged: boolean = false;
  loginForm!: FormGroup;

  constructor(private firebase: Firebase, private router: Router) {}

  async verifyLogIn(email: string, password: string) {
    let state = this.firebase.logInUser(email, password);
    if (await state) {
      this.logged = true;
    }
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      useremail: new FormControl(null, [Validators.required, Validators.email]),
      userpassword: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  async onSubmit(email: string, password: string) {
    await this.verifyLogIn(email, password);
    if (!this.logged) {
      return;
    } else {
      this.router.navigate(['home']);
    }
  }
}
