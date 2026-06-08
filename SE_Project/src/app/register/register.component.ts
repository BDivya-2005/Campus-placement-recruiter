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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  username = ''; // ✅ For student only
  selectedRole: RoleType = 'student';
  companyName = '';
  loading = false;
  error = '';
  successMsg = '';

  roles: Role[] = [
    { type: 'student', title: 'Student', demoEmail: 'student@example.com', route: '/student/dashboard', color: '#4f46e5' },
    { type: 'company', title: 'Company', demoEmail: 'company@example.com', route: '/company/dashboard', color: '#059669' },
    { type: 'admin', title: 'Admin', demoEmail: 'admin@example.com', route: '/admin/dashboard', color: '#b91c1c' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  selectRole(role: RoleType) {
    this.selectedRole = role;
    if (role !== 'company') this.companyName = '';
    if (role !== 'student') this.username = '';
  }

  getCurrentRole(): Role {
    return this.roles.find(r => r.type === this.selectedRole)!;
  }

  getDemoEmail(): string {
    return this.getCurrentRole().demoEmail;
  }

  async onRegister() {
    this.error = '';
    this.successMsg = '';
    this.loading = true;

    if (!this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill all fields!';
      this.loading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match!';
      this.loading = false;
      return;
    }

    if (this.selectedRole === 'student' && !this.username.trim()) {
      this.error = 'Please enter a username!';
      this.loading = false;
      return;
    }

    if (this.selectedRole === 'company' && !this.companyName.trim()) {
      this.error = 'Please enter your Company Name!';
      this.loading = false;
      return;
    }

    // Payload
    const userData: any = {
      email: this.email,
      password: this.password,
      role: this.selectedRole
    };

    if (this.selectedRole === 'student') {
      userData.username = this.username.trim();
    }

    if (this.selectedRole === 'company') {
      userData.companyName = this.companyName.trim();
    }

    this.http.post('http://localhost:3000/register', userData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMsg = res.message || 'Registered successfully!';
        setTimeout(() => {
          this.router.navigate([this.getCurrentRole().route]);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed!';
      }
    });
  }
}
