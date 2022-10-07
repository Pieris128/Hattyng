import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeekRoomComponent } from './geek-room/geek-room.component';
import { GlobalRoomComponent } from './global-room/global-room.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegistryComponent } from './registry/registry.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegistryComponent },
  { path: 'set-profile', component: UserProfileComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'home/room-geek', component: GeekRoomComponent },
  { path: 'home/room-global', component: GlobalRoomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
