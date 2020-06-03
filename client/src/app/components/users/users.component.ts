import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Global } from '../../services/global';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService]
})
export class UsersComponent implements OnInit {
  public url: string;
  public title: String;
  public identity;
  public token;
  public page;
  public prevPage;
  public nextPage;
  public status;
  public total;
  public pages;
  public users: User[];


  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _userService: UserService
  ) { 
    this.url = Global.url;
    this.title = "Gente";
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    this.actualPage();
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

      this.getUsers(page)
    })
  }

  getUsers(page){
    this._userService.getUsers(page).subscribe(
      response => {
        if(!response.users){
          this.status = 'error'
        }else{
          console.log(response.users)
          this.total = response.total;
          this.users = response.users;
          this.pages = response.pages;
          if(page > this.pages){
            this._router.navigate(['gente', 1])
          }
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null){
          this.status = 'error'
        }
      }
    )
  }

}
