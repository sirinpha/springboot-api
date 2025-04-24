import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { Employee } from '../../models/employee.model';
import {InputTextarea} from 'primeng/inputtextarea';
import {Ripple} from 'primeng/ripple';
import {Password} from 'primeng/password';

interface SelectItem {
  name: string;
  code: string;
}

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ButtonModule,
    InputTextarea,
    Ripple,
    Password
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.css'
})
export class EmployeeDialogComponent implements OnInit {
  employeeForm!: FormGroup;
  positions: SelectItem[] = [];
  departments: SelectItem[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee?: any }
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownOptions();

    if (this.data.employee) {
      this.patchFormValues();
    }
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      position: [null, Validators.required],
      department: [null, Validators.required],
      salary: [null],
      phone: [''],
      address: [''],
      joinDate: [new Date()],
      password: ['', Validators.required]
    });
  }

  loadDropdownOptions(): void {
    this.positions = [
      { name: 'Software Developer', code: 'software_developer' },
      { name: 'HR Manager', code: 'hr_manager' },
      { name: 'Accountant', code: 'accountant' },
      { name: 'Marketing Specialist', code: 'marketing_specialist' },
      { name: 'Product Manager', code: 'product_manager' },
      { name: 'UX Designer', code: 'ux_designer' },
      { name: 'Sales Manager', code: 'sales_manager' },
      { name: 'Customer Support', code: 'customer_support' },
      { name: 'IT Support Specialist', code: 'it_support' },
      { name: 'Project Coordinator', code: 'project_coordinator' }
    ];

    this.departments = [
      { name: 'IT', code: 'it' },
      { name: 'Human Resources', code: 'hr' },
      { name: 'Finance', code: 'finance' },
      { name: 'Marketing', code: 'marketing' },
      { name: 'Product', code: 'product' },
      { name: 'Design', code: 'design' },
      { name: 'Sales', code: 'sales' },
      { name: 'Customer Service', code: 'customer_service' },
      { name: 'Operations', code: 'operations' }
    ];
  }

  patchFormValues(): void {
    const employee = this.data.employee;
    if (!employee) return;

    // Find position and department objects that match the employee data
    const position = this.positions.find(p => p.name === employee.position);
    const department = this.departments.find(d => d.name === employee.department);

    this.employeeForm.patchValue({
      name: employee.name,
      email: employee.email,
      position: position || null,
      department: department || null,
      salary: employee.salary,
      phone: employee.phone,
      address: employee.address,
      joinDate: employee.joinDate ? new Date(employee.joinDate) : new Date(),
      password: employee.password || ''
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      return;
    }

    const formValues = this.employeeForm.value;

    const employeeData: any = {
      name: formValues.name,
      email: formValues.email,
      position: formValues.position.name,
      department: formValues.department.name,
      salary: formValues.salary,
      phone: formValues.phone,
      address: formValues.address,
      joinDate: formValues.joinDate,
      password: formValues.password
    };

    this.dialogRef.close(employeeData);
  }

  getYearRange(): string {
    const currentYear = new Date().getFullYear();
    return `${currentYear - 50}:${currentYear + 10}`;
  }

}
