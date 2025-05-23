import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {Button} from 'primeng/button';
import {TableLazyLoadEvent, TableModule} from 'primeng/table';
import {ConfirmDialog, ConfirmDialogModule} from 'primeng/confirmdialog';
import {InputText} from 'primeng/inputtext';
import {EmployeeService} from '../../services/employee.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToolbarModule} from 'primeng/toolbar';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {EmployeeDialogComponent} from '../employee-dialog/employee-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Tooltip} from 'primeng/tooltip';
import {Employee, Pagination} from '../../models/employee.model';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-employee-list',
  imports: [
    FormsModule,
    DatePipe,
    NgIf,
    Button,
    TableModule,
    ConfirmDialog,
    ConfirmDialogModule,
    InputText,
    CurrencyPipe,
    TableModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    Tooltip,
    CommonModule
  ],
  providers: [ConfirmationService, MessageService, EmployeeService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  pagination: Pagination = {
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  };

  searchQuery: string = '';
  isAdmin: boolean = false;
  isLoading: boolean = false;
  loading: unknown;
  errorMessage: string = '';


  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    // this.loadEmployees();
    this.checkUserRole();
  }

  checkUserRole(): void {
    // ตรวจสอบบทบาทผู้ใช้จาก localStorage หรือ authService
    const userRole = localStorage.getItem('user_role');
    this.isAdmin = userRole === "ADMIN";
  }

  loadEmployees(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    console.log("loadEmployees");
    this.employeeService.getEmployees(page, pageSize).subscribe(
      (data) => {
        this.employees = data?.data?.items;
        this.pagination = data?.data;
        console.log("data : ", data?.data?.items);
        this.loading = false;
      },
      (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Unable to connect to the server. Please check your connection or try again later.';
        this.loading = false;
      }
    );
  }

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.loadEmployees();
      return;
    }

    this.loading = true;
    this.employeeService.searchEmployees(this.searchQuery).subscribe(
      (data) => {
        console.log('🔍 Search response:', data); // Debug log

        // แก้ไขจาก data?.data?.items เป็น data?.data
        this.employees = data?.data || []; // Backend ส่ง Array ใน data โดยตรง
        this.loading = false;
      },
      (error) => {
        console.error('Error searching employees:', error);
        this.errorMessage = 'Error occurred while searching. Please try again.';
        this.loading = false;
      }
    );
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.employeeService.addEmployee(result).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee added successfully'
            });
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error adding employee:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to add employee'
            });
          }
        });
      }
    });
  }

  openEditDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '600px',
      data: {employee: {...employee}}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.employeeService.updateEmployee(employee.id, result).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee updated successfully'
            });
            this.loadEmployees();
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update employee'
            });
          }
        });
      }
    });
  }

  confirmDelete(employee: Employee): void {
    // ตรวจสอบข้อมูลพนักงาน
    if (!employee || employee.id === undefined) {
      console.error('Invalid employee or ID is undefined');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot delete with invalid ID'
      });
      return;
    }

    console.log('Employee to delete:', employee);
    console.log('Employee ID:', employee.id);
    console.log('Current token available:', !!localStorage.getItem('access_token'));

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // เพิ่ม logging ก่อนส่ง request
        console.log('Sending delete request for employee ID:', employee.id);

        this.employeeService.deleteEmployee(employee.id!).subscribe({
          next: (response) => {
            console.log('Delete successful, response:', response);
            this.employees = this.employees.filter(e => e.id !== employee.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee deleted successfully'
            });
          },
          error: (error: any) => {
            console.error('Error deleting employee:', error);

            // จัดการข้อผิดพลาดตามประเภท
            let errorMessage = 'Failed to delete employee';

            if (error.status === 0) {
              errorMessage = 'Cannot connect to server';
              console.error('Network error or CORS issue');
            } else if (error.status === 401) {
              errorMessage = 'Authorization expired, please login again';
              console.error('Unauthorized - token invalid or expired');
              // อาจเพิ่มการ redirect ไปหน้า login
              // this.router.navigate(['/login']);
            } else if (error.status === 403) {
              errorMessage = 'You do not have permission to delete employees';
              console.error('Forbidden - insufficient permissions');
            } else if (error.status === 404) {
              errorMessage = 'Employee not found';
              console.error('Not found - employee may have been deleted already');
            } else if (error.status >= 500) {
              errorMessage = 'Server error, please try again later';
              console.error('Server error');
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
          }
        });
      }
    });
  }

  pageChange(event: TableLazyLoadEvent) {
    console.log('pageChange', event);
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;

    const page = Math.floor(first / rows) + 1;
    const pageSize = rows;

    console.log('Page:', page);
    console.log('Page Size:', pageSize);

    this.loadEmployees(page, pageSize);
  }


  logoutpage() {
    this.authService.logout();
    window.location.href = '/login';

  }
}
