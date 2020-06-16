import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { Global } from '../../services/global';
import { PublicationService } from '../../services/publication.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  providers: [ UserService, UploadService, PublicationService ]
})
export class TimelineComponent implements OnInit {
  title: string;
  identity;
  token;
  url;
  status;
  page;
  total;
  itemsPrePage;
  pages;
  publications: Publication[];
  public noMore = false;
  showImage;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService
  ) {
    this.title = "Timeline";
    this.identity = _userService.getIdentity();
    this.token = _userService.getToken();
    this.url = Global.url;
    this.page = 1;
  }

  ngOnInit(): void {
    this.getPublications(1)
  }

  getPublications(page, adding = false){
    this._publicationService.getPublications(this.token, page).subscribe(
      response =>{
        
        if(response.publications){
          this.total = response.totalItems;
          this.pages = response.pages;
          this.itemsPrePage = response.itemsPrePage;
          
          if(!adding){
            this.publications = response.publications;
          }else{
            var arrayA = this.publications;
            var arrayB = response.publications;
            this.publications = arrayA.concat(arrayB);
           
            $("html, body").animate({scrollTop:$('html').prop("scrollHeight")},500)
          }
          
        }else{
          this.status = 'error'
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage)
        if(errorMessage != null){
          this.status = 'error';
        }
      }
    )
  };
  

  viewMore(){
    this.page += 1;
    if(this.page == this.pages){
      this.noMore = true;
    }

    this.getPublications(this.page, true)
  }

  refresh(event = null){
    this.getPublications(1)
  }

  showThisImage(id){
    this.showImage = id
  }

  hideThisImage(){
    this.showImage = 0;
  }

  deletePublication(id){
    this._publicationService.deletePublication(this.token, id).subscribe(
      response => {
        this.refresh()
      },
      error => {
        console.log(<any>error)
      }
    )
  }
}
