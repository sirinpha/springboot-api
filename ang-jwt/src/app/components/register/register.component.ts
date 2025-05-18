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
import {HttpErrorResponse} from '@angular/common/http';


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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  success: string = '';
  loading: boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  onSubmit(): void {
    // รีเซ็ตข้อความ
    this.error = '';
    this.success = '';

    // ตรวจสอบพื้นฐาน
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all information completely.';
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Please enter a valid email address';
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

    // Create registration data object
    const registerData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: 'USER'  // Default role
    };

    // Call auth service to register user
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.success = 'Registration successful! Redirecting to login...';
        this.loading = false;

        // Redirect to login page after short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        // Handle different error types
        if (error.status === 401) {
          this.error = 'Authentication error. Please try again or contact support.';
        } else if (error.status === 409) {
          this.error = 'Username or email already exists';
        } else if (error.error?.message) {
          this.error = error.error.message;
        } else {
          this.error = 'Registration failed. Please try again later.';
        }

        console.error('Registration error:', error);
      }
    });
  }
  navigateToRegister() {
    this.router.navigate(['/login']);
  }
}
