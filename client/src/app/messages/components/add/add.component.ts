import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../../models/message';
import { MessageService } from '../../../services/message.service';
import { Global } from '../../../services/global';
import { FollowsService } from '../../../services/follows.service';
import { Follow } from '../../../models/follow';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';



@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
  providers: [ FollowsService, MessageService]
})
export class AddComponent implements OnInit {
  title: string;
  message: Message;
  identity;
  token;
  url: string;
  status: string;
  follows;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _followService: FollowsService,
    private _messageService: MessageService,
    private _userService: UserService
  ) {
    this.title = 'Enviar mensaje';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = Global.url;
    this.message = new Message("","","","",this.identity._id,"")
   }

  ngOnInit(): void {
    this.getMyFollows()
  }

  onSubmit(form){
    this._messageService.addMessage(this.token, this.message).subscribe(
      response => {
        if(response.message){
          this.status = "success";
          form.reset();
        }
      },
      error => {
        this.status = "error";
        console.log(<any>error)
      }
    )
  }

  getMyFollows(){
    this._followService.getMyFollows(this.token).subscribe(
      response => {
        this.follows = response.follows
      },
      error => {
        console.log(<any>error)
      }
    )
  }

}
