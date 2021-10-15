import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { resolve } from 'dns';
import { rejects } from 'assert';
import { useDeviceLanguage } from '@firebase/auth';
import { user } from 'rxfire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  canActivate(): Promise<boolean | UrlTree> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          //resolve(true);
          this.router.navigateByUrl('/home')
        } else {
          reject('No user logged in');
          this.router.navigateByUrl('/login');
        }
      });
    });
  }

  constructor(private readonly auth: Auth, private readonly router: Router) {}
 
}
