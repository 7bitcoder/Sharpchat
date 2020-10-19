import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatText: string = "";
  counter: number = 0;

  @ViewChild('chatWindow') chatWindow: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  onTextChange(event){
    console.log(this.counter++);
  }
  sendMessage(event){
    console.log(event);
    this.chatWindow.nativeElement.insertAdjacentHTML('beforeend', '<p>' + event + '</p>');
  }
}
