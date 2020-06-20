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
  selector: 'app-sended',
  templateUrl: './sended.component.html',
  styleUrls: ['./sended.component.css'],
  providers: [FollowsService, UserService, MessageService]
})
export class SendedComponent implements OnInit {
  title: string;
  messages: Message[];
  identity;
  token;
  url: string;
  status: string;
  follows;
  page;
  pages;
  total;
  nextPage;
  prevPage;
  

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _followService: FollowsService,
    private _messageService: MessageService,
    private _userService: UserService
  ) {
    this.title = 'Mensajes enviados';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = Global.url;
   }
   
  ngOnInit(): void {
    this.actualPage()
  }

  actualPage(){
    this._route.params.subscribe(params => {
      let page = +params['page'];
      this.page = page;

      if(!+params['page']){
        page = 1;
      }

      if(!page){
        page = 1;
      }else{
        this.nextPage = page + 1;
        this.prevPage = page - 1;

        if(this.prevPage <= 0){
          this.prevPage = 1;
        }
      }

      // devolver listado de usuarios

      this.getMessage(this.token, this.page)
    })
  }

  getMessage(token, page){
    this._messageService.getEmmitMessages(token, page).subscribe(
      response => {
        if(response.messages){
          this.messages = response.messages
          this.total = response.total;          
          this.pages = response.pages;          
        }
      },
      error => {
        console.log(<any>error)
      }
    )
  }

  

}
