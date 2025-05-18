import { Injectable } from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Employee} from '../models/employee.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/auth';
  // private apiUrl = `${environment.apiUrl}/auth`;

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
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getEmployees(): Observable<Employee[]> {
    const headers = { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') };
    return this.http.get<Employee[]>(this.apiUrl, { headers });
  }

  // ดึงข้อมูลพนักงานตาม ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }


  private buildAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return '';
    }
    return token;
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  }

  refreshToken() {
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {
      refreshToken: localStorage.getItem('refresh_token')
    }).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.token);
      })
    );
  }

}
