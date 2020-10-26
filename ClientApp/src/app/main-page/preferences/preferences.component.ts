import { Component, OnInit } from '@angular/core';
import { availableSex, Preferences } from './preferences'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {

  public preferences :Preferences = new Preferences( {age: 0, sex: "Nie_podano"}, {sex: "Nie_podano"});
  avalSex = Object.keys(availableSex);
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
  }
  enterChat(){
    this.router.navigate(['/chat', {tp: this.preferences.user.sex, tw: this.preferences.user.age, pr: this.preferences.stranger.sex}])
  }

}
