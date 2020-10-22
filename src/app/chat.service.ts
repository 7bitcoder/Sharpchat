import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ServerConfig } from './server-config';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { Chatprotocol } from "./chatprotocol"

@Injectable({
  providedIn: 'root'
})
export class ChatService {

    private socket$: WebSocketSubject<Chatprotocol>;
   
    public connect(): void {
   
      if (!this.socket$ || this.socket$.closed) {
        this.socket$ = this.getNewWebSocket();
      }
    }

    getObservable(){
      return this.socket$.asObservable();
    }
   
    private getNewWebSocket() {
      console.log(ServerConfig.getUrl())
      return webSocket<Chatprotocol>(ServerConfig.getUrl());
    }

    sendData(data: Chatprotocol) {
      this.socket$.next( data );
    }

    close() {
      this.socket$.complete(); }
    }
