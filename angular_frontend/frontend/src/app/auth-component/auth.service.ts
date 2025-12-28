import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BASE_URL } from '../config';

@Injectable({ providedIn: 'root' })
export class AuthService {

  static authEmitter = new EventEmitter<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ---------------------------
  // LOGIN
  // ---------------------------
  login(email: string, password: string) {
    return this.http.post(
      `${BASE_URL}/auth/token`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Backend sets HttpOnly JWT cookie
        AuthService.authEmitter.emit(true);
      })
    );
  }

  // ---------------------------
  // SIGNUP
  // ---------------------------
  signup(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    password_confirm: string
  ) {
    return this.http.post(
      `${BASE_URL}/auth/register`,
      {
        email,
        password,
        first_name,
        last_name,
        password_confirm
      },
      { withCredentials: true }
    );
  }

  // ---------------------------
  // AUTH BOOTSTRAP (IMPORTANT)
  // Call this ONCE on app init
  // ---------------------------
  autoLogin() {
    this.user().subscribe({
      next: () => AuthService.authEmitter.emit(true),
      error: () => AuthService.authEmitter.emit(false)
    });
  }

  // ---------------------------
  // LOGOUT
  // ---------------------------
  logout() {
    this.http.post(
      `${BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    ).subscribe({
      complete: () => {
        AuthService.authEmitter.emit(false);
        this.router.navigate(['/login']);
      }
    });
  }

  // ---------------------------
  // CURRENT USER (COOKIE VALIDATION)
  // ---------------------------
  user() {
    return this.http.get(
      `${BASE_URL}/auth/user`,
      { withCredentials: true }
    );
  }

  // ---------------------------
  // TOKEN REFRESH (COOKIE)
  // ---------------------------
  refresh() {
    return this.http.post(
      `${BASE_URL}/auth/token/refresh`,
      {},
      { withCredentials: true }
    );
  }

  // ---------------------------
  // PUBLIC USER (OPTIONAL)
  // ---------------------------
  publicUser(userId: number) {
    return this.http.get(
      `${BASE_URL}/auth/user/${userId}`,
      { withCredentials: true }
    );
  }
}
