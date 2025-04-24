import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {catchError, Observable, switchMap, throwError} from 'rxjs';
import { Employee } from '../models/employee.model';
import { AuthService } from './auth.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8082/api/employees';

  constructor(private http: HttpClient, private authService: AuthService,private router: Router) {}

  getEmployees(): Observable<Employee[]> {
    const headers = this.buildAuthHeaders();
    return this.http.get<Employee[]>(this.apiUrl, { headers });
  }

  // searchEmployees(query: string): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/employees/search?query=${query}`)
  //     .pipe(
  //       catchError((error) => {
  //         if (error.status === 401) {
  //           // ลองเช็คว่า token หมดอายุหรือไม่
  //           if (this.authService.isTokenExpired()) {
  //             // ถ้าหมดอายุให้ refresh token แล้วลองใหม่
  //             return this.authService.refreshToken().pipe(
  //               switchMap(() => this.searchEmployees(query))
  //             );
  //           }
  //           // ถ้าไม่ใช่ token หมดอายุ อาจจะต้อง login ใหม่
  //           this.router.navigate(['/login']);
  //         }
  //         return throwError(() => error);
  //       })
  //     );
  // }

  searchEmployees(query: string): Observable<Employee[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<Employee[]>(`${this.apiUrl}/search`, {
      headers,
      params: { query }
    });
  }

  updateEmployee(id: number, employee: any): Observable<any> {
    const headers = this.buildAuthHeaders(); // เพิ่มการสร้าง headers
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee, { headers });
  }

  deleteEmployee(id: number): Observable<void> {
    // สร้าง headers พร้อม token สำหรับการยืนยันตัวตน
    const token = this.authService.getToken();
    console.log('Token for delete:', token); // เพิ่มเพื่อดีบัก

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // ส่ง headers พร้อมกับคำขอ DELETE
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token used for request:', token);
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  addEmployee(employee: Employee): Observable<Employee> {
    const headers = this.buildAuthHeaders(); // เมธอดที่สร้าง headers
    return this.http.post<Employee>(this.apiUrl, employee, { headers });
  }

}
