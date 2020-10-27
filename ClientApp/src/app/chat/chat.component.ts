import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service'
import { NgModule } from '@angular/core';
import { Message, User } from "./message";
import { Subject, Subscription, timer } from 'rxjs';
import { Chatprotocol } from '../chatprotocol';
import { PopMessagesComponent, popInfo } from "./pop-messages/pop-messages.component"
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {Preferences, Sex} from './../main-page/preferences/preferences'
import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';
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
      popMsg: new popInfo("Błąd połączenia", "Nie udało się połączyć z serverem, sprawdź połączenie internetowe i ponów próbę połączenie klikając w 'Ponów'", "Ponów", "Anuluj", () => this.ngOnInit())
    },
    getStrangerInfo(sex: string, age: number){
      let sexStr: string = "";
      let ageStr: string = "";
      let str: string = "";
      if(age != 0)
        ageStr = ` | ${age} lat`
      switch(sex as Sex){
        case "Inne":
          sexStr = "| Płeć: inna";
          break;
        case "Kobieta":
          sexStr = "| Płeć: kobieta";
          break;
        case "Mężczyzna":
          sexStr = "| Płeć: mężczyzna"
          break;
        case "Nie_podano":
        default:
          break; 

      }
      return `Połączono z rozmówcą ${sexStr}${ageStr}`
    }
  }
  DEBUG: boolean = false;
  userId: string = "";
  lobbyId: string = "";
  chatMessages: Message[] = [];
  counter: number = 0;
  robotMessage: string = ""
  preferences: Preferences;
  sub: Subscription;
  end: string = "Zakończ"
  @ViewChild('textInput', { static: false }) inputField: ElementRef;
  @ViewChild('msgContainer', { static: false }) msgContainer: ElementRef;
  
  isInLobby(): boolean {
    return this.lobbyId != "";
  }
  constructor(private chatService: ChatService,private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) =>{
      let age = Number(params.get('tw'));
      age = Number.isNaN(age) ? 0 : age;
      let uSex = params.get('tp') as Sex;
      uSex = uSex == undefined ? "Nie_podano" : uSex;
      let sSex = params.get('tp') as Sex;
      uSex = sSex == undefined ? "Nie_podano" : sSex;
      this.preferences = new Preferences({age: age, sex: uSex}, {sex:sSex});
    })
    this.robotMessage = this.RobotMessages.connecting;
    this.chatService.connect();

    this.sub = this.chatService.getObservable().subscribe(
      data => this.analyzeMessage(data),
      // Called whenever there is a message from the server    
      err => {
        if (this.DEBUG)
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
    this.chatService.sendData(new Chatprotocol("newClient", JSON.stringify(this.preferences)))
    console.log(JSON.stringify(this.preferences));
  }

  writingWatchdog;
  actualWriting: boolean = false;
  onTextChange(event) {
    if (this.writingWatchdog)
      this.writingWatchdog.unsubscribe();
    if (!this.actualWriting) {
      console.log("writting start")
      this.chatService.sendData(new Chatprotocol("writing", ""))
    }
    this.actualWriting = true;
    this.writingWatchdog = timer(500).subscribe(
      x => {
        if (this.actualWriting) {
          this.chatService.sendData(new Chatprotocol("stopWriting", ""))
          console.log("writting stop")
        }
        this.actualWriting = false;
      }
    )
  }

  robotChatMessage = ""
  writingAnimation = [
    ". ",
    ". .",
    ". . ."
  ]
  writingTimer;
  writingObserwer;
  animationCnt = 0;
  setStrangerWritting(type: "writing" | "stopped" | "shutNow") {
    if (this.writingObserwer)
      this.writingObserwer.unsubscribe();
    switch (type) {
      case "writing":
        this.writingObserwer = timer(0, 300).subscribe(
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

  analyzeMessage(data: Chatprotocol) {
    switch (data.command) {
      case "message":
        this.setStrangerWritting("shutNow");
        this.postMessage(User.stranger, data.data);
        break;
      case "writing":
        this.setStrangerWritting("writing");
        break;
      case "stopWriting":
        this.setStrangerWritting("stopped");
        break;
      case "strangerFound":
        let obj = JSON.parse(data.data);
        console.log(data.data)
        this.lobbyId = obj.lobbyId;
        this.robotMessage = this.RobotMessages.getStrangerInfo(obj.sex, obj.age);
        this.postMessage(User.client, "Połączono z rozmówcą napisz hej :)")
        break;
      case "userId":
        this.userId = data.data;
        this.robotMessage = this.RobotMessages.connected;
        this.chatService.sendData(new Chatprotocol("findStranger", ""))
        console.log(this.userId);
      case "ping":
      default:
        break;
    }
  }

  postMessage(who: User, message: string) {
    if (message.length != 0) {
      let msg: Message = new Message(who, message.split('\n')); //remove enter and split
      this.chatMessages.push(msg);
    }
  }

  sendMessage(message: string) {
    console.log(message)
    this.postMessage(User.you, message);
    this.inputField.nativeElement.value = '';
    let msgCont = this.msgContainer.nativeElement;
    msgCont.scrollTop = msgCont.scrollHeight;
    this.chatService.sendData(new Chatprotocol("message", message));
  }

  identify(index, message: Message) {
    return message.id;
  }

  asure: boolean = false;
  closeChat() {
    if(this.isInLobby()){
      if(this.asure){
        this.close();
        this.end = "Nowe Połączenie";
      } else {
        this.asure = true;
        this.end = "Potwierdzenie zamknięcia";
      }
    } else {
        this.asure = true;
        this.end = "Zakończ";
        this.chatService.sendData(new Chatprotocol("findStranger", ""))
    }
  }

  close(){
    this.chatService.sendData(new Chatprotocol("close", ""));
    this.lobbyId = "";
    this.postMessage(User.client, "Rozmowa zakończona")
  }
  changingValue: Subject<popInfo> = new Subject();
  showPopMessage(info: popInfo) {
    this.changingValue.next(info);
  }

  pingTimer;
  startPing() {
    this.pingTimer = timer(0, 5000).subscribe(
      x => this.chatService.sendData(new Chatprotocol("ping", ""))
    ) //every 5s
  }
}
