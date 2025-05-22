import { Injectable } from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/auth';

  constructor(private http: HttpClient) { }

  // ลงทะเบียนผู้ใช้ใหม่
  register(user: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // ส่งคำขอโดยไม่มี credentials
    return this.http.post(
      `${this.apiUrl}/register`,
      {
        name: user.name,
        email: user.email,
        password: user.password,
        enabled: true,
        role: 'USER'
      },
      { headers: headers, withCredentials: false }
    ).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.message || 'การลงทะเบียนล้มเหลว'));
      })
    );
  }

  login(user: { name: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user)
      .pipe(
        tap((response: { token: string; role: string;  }) => {
          if (response && response.token) {
            localStorage.setItem('access_token', response.token);
            localStorage.setItem('user_role', response.role);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getToken(): string {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No token found in localStorage');
      return '';
    }
    return token;
  }

// hasRole สำหรับตรวจสอบว่าผู้ใช้มีบทบาทที่กำหนดหรือไม่
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    if (!userRole) {
      return false;
    }
    return userRole === role;
  }


}
