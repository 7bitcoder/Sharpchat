import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgModule } from '@angular/core';
import { Message } from "./message";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatMessages: Message[] = [];
  counter: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  onTextChange(event){
    console.log(this.counter++);
  }

  sendMessage(message: string){
    let msg: Message = new Message("you", message);
    this.chatMessages.push(msg);
    console.log(msg);
  }

  identify(index, message: Message){
    return message.id; 
 }

}
