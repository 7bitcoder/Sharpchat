import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

declare let $: any;
export class popInfo{
  type: "serverNotReach" | "strangerDisconnected";
  constructor(
    public title: string = "",
    public msg: string = "",
    public ok: string = "",
    public close: string = "Anuluj",
    public okFunct: ()=>void = ()=>{},
    public closeFunct: ()=>void = ()=>{}
  ){}
} 
@Component({
  selector: 'app-pop-messages',
  templateUrl: './pop-messages.component.html',
  styleUrls: ['./pop-messages.component.css']
})
export class PopMessagesComponent implements OnInit {
  @ViewChild('modal') modal:ElementRef;

  public title: string = "";
  public msg: string = "";
  public close: string = "Anuluj";
  public ok: string = "";
  showModal(){
      // Show modal with jquery
      $(this.modal.nativeElement).modal('show'); 
  }
  
  public okFunct: ()=>void = ()=>{};
  public closeFunct: ()=>void = ()=>{};

  constructor() { }
  @Input() changing: Subject<popInfo>;
  
  ngOnInit(){
    this.changing.subscribe(v => {
        this.setUp(v)
        this.showModal()
    });
  }

  setUp(value: popInfo){
      this.close = value.close;
      this.msg = value.msg;
      this.ok= value.ok;
      this.title = value.title;
      this.closeFunct= value.closeFunct;
      this.okFunct= value.okFunct;
    }
}
