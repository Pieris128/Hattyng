import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firebase } from '../firebase.service';
import * as THREE from 'three';

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

  //THREE JS ENVIROMENT PROPERTIES
  canvas!: HTMLCanvasElement;
  utils!: {
    canvasWidth: number;
    canvasHeight: number;
    aspect: number;
    pixelRatio: number;
  };
  scene!: THREE.Scene;
  renderer!: THREE.WebGL1Renderer;
  perspectiveCamera!: THREE.PerspectiveCamera;
  cube!: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;

  constructor(private firebase: Firebase, private router: Router) {}

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

    ////////////////////////////////////////
    // THREE JS ENVIROMENT
    //Canvas
    this.canvas = document.querySelector(
      '.settings__left__canvas'
    ) as HTMLCanvasElement;

    this.utils = {
      canvasWidth: this.canvas.clientWidth,
      canvasHeight: this.canvas.clientHeight,
      aspect: this.canvas.clientWidth / this.canvas.clientHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    //Scene
    this.scene = new THREE.Scene();

    //Renderer
    this.renderer = new THREE.WebGL1Renderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.utils.canvasWidth, this.utils.canvasHeight);
    this.renderer.pixelRatio = this.utils.pixelRatio;

    // Camera
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      55,
      this.utils.aspect,
      1,
      4
    );
    this.perspectiveCamera.position.z = 3;

    // Scene Content
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.rotation.y = 45;
    this.cube.rotation.z = -20;
    this.scene.add(this.cube);

    // Init Render Loop
    this.animate();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  //////////////////////////////
  //THREE JS VIEW METHODS
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.cube.rotation.y -= 0.01;

    this.renderer.render(this.scene, this.perspectiveCamera);
  }

  onResize() {
    console.log('rezised');
    // Utils Update
    this.utils.canvasWidth = this.canvas.clientWidth;
    this.utils.canvasHeight = this.canvas.clientHeight;
    this.utils.aspect = this.utils.canvasWidth / this.utils.canvasHeight;
    this.utils.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Renderer Update
    this.renderer.setSize(this.utils.canvasWidth, this.utils.canvasHeight);
    this.renderer.pixelRatio = this.utils.pixelRatio;

    // Camera Update
    this.perspectiveCamera.aspect = this.utils.aspect;
  }

  //////////////////////////////

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
    let canUse = await this.firebase.readUserData(username);
    if (canUse) {
      this.userExists = true;
      return;
    } else {
      this.firebase.setProfileAuth(username);
      this.firebase.writeUserData(username, description, this.imgSelected);
      this.router.navigate(['home']);
    }
  }
}
