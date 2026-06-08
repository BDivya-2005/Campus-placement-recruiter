import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Student {
  _id: string;
  name: string;
  email: string;
  branch: string;
}

interface Company {
  _id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  students: Student[] = [];
  companies: Company[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchStudents();
    this.fetchCompanies();
  }

  fetchStudents() {
    this.http.get<Student[]>('http://localhost:3000/students').subscribe({
      next: (res) => (this.students = res),
      error: (err) => console.error('Error fetching students:', err),
    });
  }

  fetchCompanies() {
    this.http.get<Company[]>('http://localhost:3000/companies').subscribe({
      next: (res) => (this.companies = res),
      error: (err) => console.error('Error fetching companies:', err),
    });
  }

  deleteStudent(id: string) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.http.delete(`http://localhost:3000/students/${id}`).subscribe({
        next: () => {
          this.students = this.students.filter((s) => s._id !== id);
          alert('Student deleted successfully.');
        },
        error: (err) => console.error('Error deleting student:', err),
      });
    }
  }

  deleteCompany(id: string) {
    if (confirm('Are you sure you want to delete this company?')) {
      this.http.delete(`http://localhost:3000/companies/${id}`).subscribe({
        next: () => {
          this.companies = this.companies.filter((c) => c._id !== id);
          alert('Company deleted successfully.');
        },
        error: (err) => console.error('Error deleting company:', err),
      });
    }
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}
