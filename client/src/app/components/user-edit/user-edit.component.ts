import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  public title: string;
  public user;
  public identity;
  public token;
  public status;

  constructor(
    private _userService : UserService,
    private _route : ActivatedRoute,
    private _router : Router
  ) {
    this.title = 'Actualizar mis datos';
    this.user =  this._userService.getIdentity();
    this.identity = this.user;
    this.token = this._userService.getToken();
   }

  ngOnInit(): void {
    console.log(this.identity)
  }

  onSubmit(){
    this._userService.updateUser(this.user).subscribe(
      response => {
        if(!response.user){
          this.status = 'error';
        }else{
          this.status = 'success';
          localStorage.setItem('identity', JSON.stringify(this.user));
          this.identity = this.user;

          // subida de imagen
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage)

        if(errorMessage != null){
          this.status = 'error'
        }
      }
    )
  }

}
