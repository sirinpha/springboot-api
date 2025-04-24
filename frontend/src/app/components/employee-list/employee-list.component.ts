import {Component, Inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {ConfirmDialog, ConfirmDialogModule} from 'primeng/confirmdialog';
import {InputText} from 'primeng/inputtext';
import {Employee} from '../../models/employee.model';
import {EmployeeService} from '../../services/employee.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {Toolbar} from 'primeng/toolbar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import {EmployeeDialogComponent} from '../employee-dialog/employee-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {AuthService} from '../../services/auth.service';
import {Tooltip} from 'primeng/tooltip';
import {Card} from 'primeng/card';

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
    Tooltip
  ],
  providers: [ConfirmationService, MessageService,EmployeeService],
  templateUrl:'./employee-list.component.html',
  styleUrl:'./employee-list.component.css'
})
export class EmployeeListComponent  implements OnInit{
  employees: Employee[] = [];
  searchQuery: string = '';
  isAdmin: boolean = false;
  isLoading: boolean = false;
  loading: unknown;
  errorMessage: string = '';

  constructor(
    // private authService: AuthService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.checkUserRole();
  }

  checkUserRole(): void {
    // ตรวจสอบบทบาทผู้ใช้จาก localStorage หรือ authService
    const userRole = localStorage.getItem('user_role');
    this.isAdmin = userRole === "ADMIN";
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe(
      (data) => {
        this.employees = data;
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

    this.isLoading = true;
    this.employeeService.searchEmployees(this.searchQuery).subscribe({
      next: (data) => {
        this.employees = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching employees:', error);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error searching employees'
        });
      }
    });
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
      data: { employee: { ...employee } }
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
    // ไม่ต้องหาพนักงานอีกเพราะเราได้รับวัตถุพนักงานเต็มรูปแบบมาแล้ว
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

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeeService.deleteEmployee(employee.id!).subscribe({
          next: () => {
            this.employees = this.employees.filter(e => e.id !== employee.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee deleted successfully'
            });
          },
          error: (error: any) => {
            console.error('Error deleting employee:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete employee'
            });
          }
        });
      }
    });
  }

  // confirmDelete(id: number): void {
  //   // อาจมีการแสดง dialog ยืนยันก่อน
  //   console.log('Attempting to delete employee ID:', id);
  //
  //   this.employeeService.deleteEmployee(id).subscribe({
  //     next: () => {
  //       console.log('Employee deleted successfully');
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: 'Employee deleted successfully'
  //       });
  //       this.loadEmployees();
  //     },
  //     error: (error) => {
  //       console.error('Error deleting employee:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to delete employee'
  //       });
  //     }
  //   });
  // }
}
