import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { UserService } from '../../services/user.service';
import { Global } from '../../services/global';
import * as $ from 'jquery';


@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.css'],
  providers: [UserService, PublicationService]
})
export class PublicationComponent implements OnInit {
  total;
  identity;
  pages:number;
  itemsPrePage;
  status;
  publications: Publication[];
  token;
  noMore;
  page: number;
  url;
  showImage;
  @Input() user: string;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService
  ) { 
    this.token = this._userService.getToken();
    this.url = Global.url;
    this.page = 1;
    this.identity = this._userService.getIdentity();
  }

  ngOnInit(): void {
    this.getPublications(this.user, this.page)
  }

  getPublications(user, page, adding = false){
    this._publicationService.getPublicationsUser(this.token, user, +page).subscribe(
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
    

    if(Number(this.page) == Number(this.pages)){
      this.noMore = true;
    }

    this.getPublications(this.user, 1, true)
  }

  refresh(event = null){
    this.getPublications(this.user, 1)
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
