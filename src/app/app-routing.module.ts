import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddroomComponent } from './addroom/addroom.component';
import { ChatroomComponent } from './chatroom/chatroom.component';
import { LoginComponent } from './login/login.component';
import { RegistryComponent } from './registry/registry.component';
import { RoomlistComponent } from './roomlist/roomlist.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login/signup', component: RegistryComponent },
  { path: 'roomlist/:nickname', component: RoomlistComponent },
  { path: 'addroom', component: AddroomComponent },
  { path: 'chatroom/:nickname/:roomid', component: ChatroomComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
