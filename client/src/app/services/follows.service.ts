import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Follow } from '../models/follow';
import { Global } from './global';

@Injectable({
  providedIn: 'root'
})
export class FollowsService {
  public url:string;

  constructor(
    private _http: HttpClient
  ) {
    this.url = Global.url;
   }

   addFollow(token, follow): Observable<any>{
    let params = JSON.stringify(follow);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
                                   
    return this._http.post(this.url + 'follow', params, {headers: headers})                                 
   }

   deleteFollow(token, id){
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
    
    return this._http.delete(this.url + 'follow/' + id,{headers: headers})
   }

   getFollowing(token, userId = null, page):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
    .set('Authorization', token);

    var url = this.url+'following'
    if(userId != null){
      url = this.url+'following/'+ userId + '/' + page;
    }
    return this._http.get( url, {headers:headers})

   }
}
