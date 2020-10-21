import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ServerConfig } from './server-config';
import { catchError, tap, switchAll } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Format {
  constructor(
  public message: string
  ){}
}
export class ChatService {

    private socket$: WebSocketSubject<Format>;
    private messagesSubject$ = new Subject();
   
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
      return webSocket<Format>(ServerConfig.getUrl());
    }

    sendMessage(msg: string) {
      this.socket$.next( new Format(msg) );
    }

    close() {
      this.socket$.complete(); }
    }
