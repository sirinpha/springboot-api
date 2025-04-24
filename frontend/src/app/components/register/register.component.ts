import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MessageModule} from 'primeng/message';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {CommonModule} from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import {FloatLabel} from 'primeng/floatlabel';
import {Password} from 'primeng/password';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {DropdownModule} from 'primeng/dropdown';
import {Calendar} from 'primeng/calendar';
import {InputTextarea} from 'primeng/inputtextarea';

interface SelectItem {
  name: string;
  code: string;
}

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    MessageModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    MenubarModule,
    Password,
    FloatLabel,
    DropdownModule,
    Calendar,
    InputTextarea
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  // ตัวแปร user สำหรับฟิลด์ที่เหลือ
  user = {
    salary: null as number | null,
    joinDate: new Date(),
    phone: '',
    address: ''
  };

  // ตัวเลือกสำหรับตำแหน่ง
  positions: SelectItem[] = [];
  selectedPosition: SelectItem | null = null;

  // ตัวเลือกสำหรับแผนก
  departments: SelectItem[] = [];
  selectedDepartment: SelectItem | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // กำหนดตัวเลือกตำแหน่ง
    this.positions = [
      { name: 'Software Developer', code: 'Software_Developer' },
      { name: 'HR Manager', code: 'HR_Manager' },
      { name: 'Accountant', code: 'Accountant' },
      { name: 'Marketing Specialist', code: 'Marketing_Specialist' },
      { name: 'Product Manager', code: 'Product_Manager' },
      { name: 'UX Designer', code: 'UX_Designer' },
      { name: 'Sales Manager', code: 'Sales_Manager' },
      { name: 'Customer Support', code: 'Customer_Support' },
      { name: 'IT Support Specialist', code: 'IT_Support_Specialist' },
      { name: 'Project Coordinator', code: 'Project_Coordinator' }
    ];

    // กำหนดตัวเลือกแผนก
    this.departments = [
      { name: 'IT', code: 'IT' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'Finance', code: 'Finance' },
      { name: 'Marketing', code: 'Marketing' },
      { name: 'Product', code: 'Product' },
      { name: 'Design', code: 'Design' },
      { name: 'Sales', code: 'Sales' },
      { name: 'Customer Service', code: 'Customer_Service' },
      { name: 'Operations', code: 'Operations' }
    ];
  }

  onSubmit(): void {
    // รีเซ็ตข้อความ
    this.error = '';
    this.success = '';

    // ตรวจสอบพื้นฐาน
    if (!this.username || !this.email || !this.password || !this.confirmPassword ||
      !this.selectedPosition || !this.selectedDepartment || !this.user.salary ||
      !this.user.phone || !this.user.address) {
      this.error = 'Please fill in all information completely.';
      return;
    }

    // ตรวจสอบอีเมล
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    // ตรวจสอบรหัสผ่านตรงกัน
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // ตรวจสอบความแข็งแรงของรหัสผ่าน
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }

    this.loading = true;

    // รวมข้อมูลที่จะส่งไปยัง API
    const userData = {
      name: this.username,
      email: this.email,
      password: this.password,
      position: this.selectedPosition?.name,
      department: this.selectedDepartment?.name,
      join_date: this.user.joinDate,
      salary: this.user.salary,
      phone: this.user.phone,
      address: this.user.address
    };

    // เรียกใช้บริการลงทะเบียน
    this.authService.register(userData)
      .subscribe({
        next: (response) => {
          this.success = 'Registration completed! Please log in.';
          this.loading = false;

          // Redirect to login page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.error = error.error?.message || 'There was an error while registering.';
          this.loading = false;
        }
      });
  }

  navigateToRegister() {
    this.router.navigate(['/login']);
  }
}
