import { Component } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { timer } from 'rxjs';
import { NgModule } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sharpchat';
  url = "ws://localhost:8765";
  context = ""
  hide: boolean = true;
  color = 1;
  mem = Array<number>(12);
  constructor(){
  }
  check(val: Object){
    let text: string = JSON.stringify(val);
    console.log(text);
  }
}
