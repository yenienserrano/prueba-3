import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Global }from '../../services/global';
import { Publication } from '../../models/publication';
import { PublicationService } from 'src/app/services/publication.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: [UserService, PublicationService, UploadService]
})
export class SidebarComponent implements OnInit {
  identity;
  token;
  stats;
  url;
  status;
  publication: Publication;
  

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uploadService: UploadService,
    private _userService: UserService,
    private _publicationService: PublicationService
    
    ) { 
    this.token = this._userService.getToken();
    this.identity = this._userService.getIdentity();
    this.stats = this._userService.getStats();
    this.url = Global.url;
    this.publication = new Publication("","","","",this.identity._id)
  }

  ngOnInit(): void {
  }

  onSubmit(form, $event){
    this._publicationService.addPublication(this.token, this.publication).subscribe(
      response => {
        if(response.publication){
          if(this.filesToUpload && this.filesToUpload.length){
            // subir image
            this._uploadService.makeFileRequest(this.url+'upload-image-pub/'+response.publication._id,[], this.filesToUpload, this.token, 'image')
            .then((result:any)=>{
              this.publication.file = result.image;
              this.status = "success";
              form.reset();
              this.sended.emit({send:"true"})
              this._router.navigate(['/timeline']);
            })
            
          }else{
            this.status = "success";
              form.reset();
              this._router.navigate(['/timeline']);
              this.sended.emit({send:"true"})
          }
          

        }},
        error=> {
          var errorMessage = <any>error;

          console.log(errorMessage);
          if(errorMessage != null){
            this.status = "error"
          }
        }
    )
  }

  public filesToUpload: Array<File>;

  fileChangeEvent(fileInput: any){
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  // Output
  @Output() sended = new EventEmitter()
  sendPublication(event){
    this.sended.emit({send:"true"})
  }
}
