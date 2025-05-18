import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // ตรวจสอบบทบาทถ้ามีการกำหนด
    if (route.data['roles']) {
      const userRole = this.authService.getUserRole();
      if (!userRole || !route.data['roles'].includes(userRole)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
