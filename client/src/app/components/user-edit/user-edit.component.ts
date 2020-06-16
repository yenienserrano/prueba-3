import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { Global } from '../../services/global';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService, UploadService]
})
export class UserEditComponent implements OnInit {
  public url;
  public title: string;
  public user: User;
  public identity;
  public token;
  public status;

  constructor(
    private _userService : UserService,
    private _uploadService : UploadService,
    private _route : ActivatedRoute,
    private _router : Router
  ) {
    this.title = 'Actualizar mis datos';
    this.user = JSON.parse(JSON.stringify( this._userService.getIdentity()));
    this.identity = this.user;
    this.token = this._userService.getToken();
    this.url = Global.url;
   }

  ngOnInit(): void {
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

          this._uploadService.makeFileRequest(this.url+'upload-image-user/'+this.identity._id,[],this.filesToUpload, this.token, "image")
                              .then((result: any) => {
                                this.user.image = result.user.image;
          localStorage.setItem('identity', JSON.stringify(this.user))
          })
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
  public filesToUpload: Array<File>;
 
  fileChangeEvent(fileInput:any){
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

}
