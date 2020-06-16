import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Publication } from '../models/publication';
import { Global } from './global';

@Injectable()

export class PublicationService {
    url:string;

    constructor(
        public _http: HttpClient,
    ){
        this.url = Global.url;
    }

    addPublication(token, publication):Observable<any>{
        let params = JSON.stringify(publication);
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                       .set('Authorization', token);
                                       
        return this._http.post(this.url+'publication', params,{ headers: headers});
    }   

    getPublications(token, page = 1):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
        .set('Authorization', token);

        return this._http.get(this.url+'publications/'+page, {headers:headers})
    }

    getPublicationsUser(token, user, page = 1):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
        .set('Authorization', token);

        return this._http.get(this.url+'publications-user/'+user+"/"+page, {headers:headers})
    }

    deletePublication(token, id){
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
        .set('Authorization', token);

        return this._http.delete(this.url+'publication/'+id, {headers:headers})
    }
}