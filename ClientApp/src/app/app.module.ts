import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { MainPageComponent } from './main-page/main-page.component';
import { ChatComponent } from './chat/chat.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {  ChatService } from "./chat.service";
import { PopMessagesComponent } from './chat/pop-messages/pop-messages.component';
import { PreferencesComponent } from './main-page/preferences/preferences.component'

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    ChatComponent,
    PageNotFoundComponent,
    PopMessagesComponent,
    PreferencesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
