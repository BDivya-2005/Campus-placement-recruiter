import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

type RoleType = 'student' | 'company' | 'admin';

interface Role {
  type: RoleType;
  title: string;
  demoEmail: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  companyName = '';
  selectedRole: RoleType = 'student';
  loading = false;
  error = '';

  roles: Role[] = [
    { type: 'student', title: 'Student', demoEmail: 'student@example.com', route: '/student/dashboard', color: '#4f46e5' },
    { type: 'company', title: 'Company', demoEmail: 'company@example.com', route: '/company/dashboard', color: '#059669' },
    { type: 'admin', title: 'Admin', demoEmail: 'admin@example.com', route: '/admin/dashboard', color: '#b91c1c' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  selectRole(role: RoleType) {
    this.selectedRole = role;
    if (role !== 'company') this.companyName = ''; // reset company name
  }

  getCurrentRole(): Role {
    return this.roles.find(r => r.type === this.selectedRole)!;
  }

  getDemoEmail(): string {
    return this.getCurrentRole().demoEmail;
  }

  onLogin() {
    this.error = '';
    this.loading = true;

    if (!this.email || !this.password) {
      this.error = 'Please fill all fields!';
      this.loading = false;
      return;
    }

    const loginData: any = {
      email: this.email,
      password: this.password,
      role: this.selectedRole
    };

    if (this.selectedRole === 'company') {
      if (!this.companyName) {
        this.error = 'Please enter your Company Name!';
        this.loading = false;
        return;
      }
      loginData.companyName = this.companyName;
    }

    this.http.post('http://localhost:3000/login', loginData).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (this.selectedRole === 'student') {
          // ✅ Student login
          localStorage.setItem('userId', res.id);
          localStorage.setItem('userName', res.name);
          localStorage.setItem('userRole', 'student');
        } else if (this.selectedRole === 'company') {
          // ✅ Company login (object)
          localStorage.setItem('companyData', JSON.stringify({
            companyId: res.id,
            companyName: res.name
          }));
          localStorage.setItem('userRole', 'company');
        } else if (this.selectedRole === 'admin') {
          // ✅ Admin login (object)
          localStorage.setItem('adminData', JSON.stringify({
            adminId: res.id,
            email: res.email
          }));
          localStorage.setItem('userRole', 'admin');
        }

        this.router.navigate([this.getCurrentRole().route]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed!';
      }
    });
  }
}
