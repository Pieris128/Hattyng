import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Firebase } from '../firebase.service';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.scss'],
})
export class RegistryComponent implements OnInit {
  registryForm!: FormGroup;
  logged: boolean = false;

  constructor(
    private firebase: Firebase,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.registryForm = new FormGroup({
      useremail: new FormControl(null, [Validators.required, Validators.email]),
      userpassword: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  async verifyRegistry(email: string, password: string) {
    let state = this.firebase.createUser(email, password);
    if (await state) {
      this.logged = true;
    }
  }

  async onSubmit(email: string, password: string) {
    await this.verifyRegistry(email, password);
    if (!this.logged) {
      return;
    } else {
      this.router.navigate(['set-profile'], { relativeTo: this.route });
    }
  }
}
