import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Student {
  id: string;
  name: string;
  email: string;
  branch?: string;
  year?: string;
  appliedAt?: string;
  appliedTo?: string; // Job title
  jobTitle?: string;  // Optional fallback from backend
}

@Component({
  selector: 'app-company-students',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './company-students.component.html',
  styleUrls: ['./company-students.component.css']
})
export class CompanyStudentsComponent implements OnInit {
  applicants: Student[] = [];
  companyId: string = localStorage.getItem('companyId') || ''; // assuming company is logged in

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchApplicants();
  }

  fetchApplicants() {
    if (!this.companyId) return;

    this.http.get<Student[]>(`http://localhost:3000/company/${this.companyId}/students`)
      .subscribe({
        next: (res) => {
          // Map backend job info to appliedTo for display
          this.applicants = res.map(app => ({
            ...app,
            appliedTo: app.appliedTo || app.jobTitle || '' // fallback if backend uses jobTitle
          }));
        },
        error: (err) => console.error('Error fetching applicants:', err)
      });
  }

  deleteApplicant(index: number) {
    const confirmDelete = confirm(`Are you sure you want to remove ${this.applicants[index].name}?`);
    if (confirmDelete) {
      this.applicants.splice(index, 1);
      // Optionally, call backend API to delete the application
    }
  }
}
