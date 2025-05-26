import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {ApiResponse, Employee, PagedResponse} from '../models/employee.model';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8082/api/employees';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
  }

  getEmployees(page: number, pageSize: number, search?: string): Observable<ApiResponse<PagedResponse<Employee>>> {
    const headers = this.buildAuthHeaders();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // เพิ่ม search parameter ถ้ามีค่า
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<PagedResponse<Employee>>>(this.apiUrl, {headers, params})
      .pipe(
        tap(response => console.log('📡 API Response:', response)),
        catchError(error => {
          console.error('Error fetching employees:', error);
          return throwError(() => new Error('Failed to fetch employees. Please try again.'));
        })
      );
  }

  updateEmployee(id: number, employee: any): Observable<any> {
    const headers = this.buildAuthHeaders(); // เพิ่มการสร้าง headers
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee, {headers});
  }


  deleteEmployee(id: number): Observable<void> {
    // เพิ่ม logging เพื่อตรวจสอบ
    console.log('Service: Deleting employee with ID:', id);
    console.log('Current token:', localStorage.getItem('access_token'));

    // สร้าง headers พร้อม token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    });

    console.log('Headers being sent:', headers);

    // ส่ง request พร้อม headers
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers})
      .pipe(
        tap(() => console.log('Delete request successful')),
        catchError(error => {
          if (error.status === 401 || error.status === 403) {
            console.error('Authentication error - please log in again');
          } else if (error.status === 404) {
            console.error('Employee not found');
          } else {
            console.error('Delete request failed:', error);
          }
          return throwError(() => error);
        })
      );
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token used for request:', token);
    return new HttpHeaders({'Authorization': `Bearer ${token}`});
  }

  addEmployee(employee: Employee): Observable<Employee> {
    const headers = this.buildAuthHeaders(); // เมธอดที่สร้าง headers
    return this.http.post<Employee>(this.apiUrl, employee, {headers});
  }

}
