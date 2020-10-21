import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service'
import { NgModule } from '@angular/core';
import { Message, User } from "./message";
import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  RobotMessages = {
    connecting: "Connecting to server"
  }
  liveData$
  chatMessages: Message[] = [];
  counter: number = 0;
  robotMessage: string = ""
  @ViewChild('textInput') inputField: ElementRef;
  @ViewChild('msgContainer') msgContainer: ElementRef;
  
  constructor(private chatService: ChatService) {
  }
  
  ngOnInit(): void {
    this.robotMessage = this.RobotMessages.connecting;
    this.chatService.connect();

    this.chatService.getObservable().subscribe(    
      msg => this.postMessage(User.stranger, msg.message), 
      // Called whenever there is a message from the server    
      err => console.log(err), 
      // Called if WebSocket API signals some kind of error    
      () => console.log('complete') 
      // Called when connection is closed (for whatever reason)  
   );
    console.log("init ended")
  }

  onTextChange(event){
    console.log(this.counter++);
  }

  postMessage(who: User, message: string){
    if(! (message.length == 0 || message.length == 1)) {
      let msg: Message = new Message(who, message.slice(0,-1).split('\n')); //remove enter and split
      this.chatMessages.push(msg);
    }
  }

  sendMessage(message: string){
    console.log(message)
    this.postMessage(User.you, message);
    this.inputField.nativeElement.value = '';
    let msgCont = this.msgContainer.nativeElement;
    msgCont.scrollTop = msgCont.scrollHeight;
    this.chatService.sendMessage(message);
  }

  identify(index, message: Message){
    return message.id; 
  }

  closeChat(){
    console.log("closed")
  }
}
