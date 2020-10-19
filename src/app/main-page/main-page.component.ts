import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  public entranceMessage: string = "Wybierz swoją płeć oraz zaznacz preferencje dotycznące rozmówcy";
  constructor() { }

  ngOnInit(): void {
  }

}
