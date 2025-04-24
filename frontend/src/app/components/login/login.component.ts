import { Component } from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {FloatLabel} from 'primeng/floatlabel';
import {Password} from 'primeng/password';
import {Message} from 'primeng/message';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {ButtonDirective} from 'primeng/button';
import {Ripple} from 'primeng/ripple';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    InputText,
    FloatLabel,
    Password,
    Message,
    FormsModule,
    ButtonDirective,
    Ripple
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  name: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.login({name: this.name, password: this.password}).subscribe({
      next: (response) => {
        console.log('Login success:', response);
        localStorage.setItem('token', response.token);

        const role = response.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/employee-list']);
        } else {
          this.router.navigate(['/employee-list']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = 'Login failed: ' + (err.error?.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

}
