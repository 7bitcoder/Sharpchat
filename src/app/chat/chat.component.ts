import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgModule } from '@angular/core';
import { Message, User } from "./message";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatMessages: Message[] = [];
  counter: number = 0;

  @ViewChild('textInput') inputField: ElementRef;
  @ViewChild('msgContainer') msgContainer: ElementRef;
  
  constructor() { }

  ngOnInit(): void {

  }

  onTextChange(event){
    console.log(this.counter++);
  }

  sendMessage(message: string){
    if(message.length == 0) 
      return;

    let msg: Message = new Message(User.you, message);
    this.chatMessages.push(msg);
    console.log(msg);
    this.inputField.nativeElement.value = '';
    let msgCont = this.msgContainer.nativeElement;
    msgCont.scrollTop = msgCont.scrollHeight;
  }

  identify(index, message: Message){
    return message.id; 
 }

}
