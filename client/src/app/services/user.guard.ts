import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable()

export class UserGuard implements CanActivate{
    identity;
    constructor(
        private _router: Router,
        private _userService: UserService
    ){

    }

    canActivate(){
        this.identity = this._userService.getIdentity();

        if(this.identity && (this.identity.role == 'Role_user' || this.identity.role == 'ROLE_ADMIN')){
            return true;
        }else{
            this._router.navigate(['/login']);
            return false;
        }
    }
}