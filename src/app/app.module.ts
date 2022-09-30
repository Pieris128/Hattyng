//
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DatePipe } from '@angular/common';
// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ChatroomComponent } from './chatroom/chatroom.component';
import { RegistryComponent } from './registry/registry.component';
import { AutocompleteOffDirective } from './autocomplete-off.directive';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatroomComponent,
    RegistryComponent,
    AutocompleteOffDirective,
    UserProfileComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
