import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [UserService]
})
export class HomeComponent implements OnInit {
  public title: string;
  identity

  constructor(
    private _userService: UserService
  ) { 
    this.title = "Bienvenido a Ian Social"
    this.identity = this._userService.getIdentity();
  }

  ngOnInit(): void {
  }

}
