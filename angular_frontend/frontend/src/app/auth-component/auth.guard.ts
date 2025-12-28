import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    return this.authService.user().pipe(
      map(() => {
        // Cookie is valid
        AuthService.authEmitter.emit(true);
        return true;
      }),
      catchError(() => {
        // Cookie missing or expired
        AuthService.authEmitter.emit(false);
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
