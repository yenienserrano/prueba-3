import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowsService } from '../../services/follows.service';
import { Global } from '../../services/global';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [UserService, FollowsService]
})
export class ProfileComponent implements OnInit {
  title: string;
  user: User;
  status:string;
  identity;
  token;
  url;
  stats;
  followed;
  following;
  follows;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowsService
  ) {
    this.title = 'Perfil';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = Global.url;
    this.following = false;
    this.followed = false;
   }

  ngOnInit(): void {
    this.loadPage();
    this.getUsers(1)
  }

  loadPage(){
    this._route.params.subscribe(params => {
      let id = params['id'];

      this.getUser(id);
      this.getCounters(id);
    })
  }

  getUser(id){
    this._userService.getUser(id).subscribe(
      response=> {
        if(response.user){
          this.user = response.user;
          console.log(response)
          if(response.followed && response.following._id){
            this.followed = true;
          }else{
            this.followed = false; 
          }

          if(response.following && response.following._id){
            this.following = true;
          }else{
            this.following = false; 
          }

        }else{
          this.status = 'error'
        }
      },
      error=>{
        console.log(<any>error)
        this._router.navigate(['/perfile',this.identity._id])
      }
    )
  }

  getCounters(id){
    this._userService.getCounters(id).subscribe(
      response => {
        this.stats = response;
        console.log(response)
      },
      error => {
        console.log(<any>error)
      }
    )
  }

  public followUserOver;

  mouseEnter(userId){
    this.followUserOver = userId;
  }

  mouseLeave(){
    this.followUserOver = 0;
  }

  getUsers(page){
    this._userService.getUsers(page).subscribe(
      response => {
        if(!response.users){
          this.status = 'error'
        }else{
          this.follows = response.usersFollowing;
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

  followUser(followed){
    let follow = new Follow('',this.identity._id, followed);

    this._followService.addFollow(this.token, follow).subscribe(
      response => {
        if(!response.follow){
          this.status = 'error'
        }else{
          this.status = 'success';
          this.follows.push(followed)
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null){
          this.status = 'error'
        };
      }
    )
  }

  unfollowUser(followed){
    this._followService.deleteFollow(this.token, followed).subscribe(
      response => {
        var search = this.follows.indexOf(followed);
        if(search != -1){
          this.follows.splice(search, 1);
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null){
          this.status = 'error'
        };
      }
    )
  }

  

}
