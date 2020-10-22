import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service'
import { NgModule } from '@angular/core';
import { Message, User } from "./message";
import { Subject, Subscription, timer } from 'rxjs';
import { Chatprotocol } from '../chatprotocol';
import { PopMessagesComponent, popInfo } from "./pop-messages/pop-messages.component"

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  RobotMessages = {
    connecting: "Łączę z serverem",
    connected: "Połączono z serverem",
    searching: "Szukanie Rozmówcy",
    couldNotReachServer: {
      title: "Nie można połączyć się z serverem",
      popMsg: new popInfo("Błąd połączenia", "Nie udało się połączyć z serverem, sprawdź połączenie internetowe i ponów próbę połączenie klikając w 'Ponów'", "Ponów", "Anuluj", () => this.ngOnInit() )
    }
  }
  DEBUG: boolean = true;
  liveData$
  chatMessages: Message[] = [];
  counter: number = 0;
  robotMessage: string = ""

  sub: Subscription;
  
  @ViewChild('textInput') inputField: ElementRef;
  @ViewChild('msgContainer') msgContainer: ElementRef;
  
  constructor(private chatService: ChatService) {
  }
  
  ngOnInit(): void {
    this.robotMessage = this.RobotMessages.connecting;
    this.chatService.connect();

    this.sub = this.chatService.getObservable().subscribe(    
      data =>  this.analyzeMessage(data),
      // Called whenever there is a message from the server    
      err => {
        if(this.DEBUG)
          return;
        this.sub.unsubscribe();
        this.robotMessage = this.RobotMessages.couldNotReachServer.title;
        this.showPopMessage(this.RobotMessages.couldNotReachServer.popMsg);
      }, 
      // Called if WebSocket API signals some kind of error    
      () => {
        this.robotMessage = this.RobotMessages.searching;
      },
      // Called when connection is closed (for whatever reason)  
   );
    this.startPing();
    console.log("init ended")
  }

  writingWatchdog;
  actualWriting: boolean = false;
  onTextChange(event){
    if(this.writingWatchdog)
      this.writingWatchdog.unsubscribe();
    if(!this.actualWriting){
      console.log("writting start")
      this.chatService.sendData(new Chatprotocol("writing", ""))
    }
    this.actualWriting = true;
    this.writingWatchdog = timer(500).subscribe(
      x => {
        if(this.actualWriting){
          this.chatService.sendData(new Chatprotocol("stopwriting", ""))
          console.log("writting stop")
        }
        this.actualWriting = false;
      }
    )
  }

  robotChatMessage = ""
  writingAnimation = [
    "",
    ". ",
    ". .",
    ". . ."
  ]
  writingTimer;
  writingObserwer;
  animationCnt = 0;
  setStrangerWritting(type: "writing"  | "stopped" | "shutNow"){
    if(this.writingObserwer)
      this.writingObserwer.unsubscribe();
    switch(type){
      case "writing":  
        this.writingObserwer = timer(0, 500).subscribe(
          x => {
            this.robotChatMessage = Message.getMessagePrefix(User.stranger) + " pisze " + this.writingAnimation[this.animationCnt];
            this.animationCnt++;
            this.animationCnt %= this.writingAnimation.length;
          }
        )
        break;
      case "stopped":
        this.writingObserwer = timer(2000).subscribe(
        x => {
          this.animationCnt = 0;
          this.robotChatMessage = "";
        })
        break;
      case "shutNow":
        this.robotChatMessage = "";
        break;
      default:
        break;
    }
  }

  analyzeMessage(data: Chatprotocol){
    switch(data.command){
      case "message":
        this.setStrangerWritting("shutNow");
        this.postMessage(User.stranger, data.data);
        break;
      case "writing":
        this.setStrangerWritting("writing");
        break;
      case "stopwriting":
        this.setStrangerWritting("stopped");
        break;
      case "ping":
      default:
        break;
    }
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
    this.chatService.sendData( new Chatprotocol("message", message));
  }

  identify(index, message: Message){
    return message.id; 
  }

  closeChat(){
    console.log("closed")
  }

  changingValue: Subject<popInfo> = new Subject();
  showPopMessage(info: popInfo){
    this.changingValue.next(info);
  }

  pingTimer;
  startPing(){
    this.pingTimer = timer(0, 5000 ).subscribe(
      x => this.chatService.sendData( new Chatprotocol("ping", ""))
    ) //every 5s
  }
}
