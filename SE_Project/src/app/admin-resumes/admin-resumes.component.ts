import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Student {
  name: string;
  email: string;
  resumeUrl?: string;
}

@Component({
  selector: 'app-admin-resumes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-resumes.component.html',
  styleUrls: ['./admin-resumes.component.css']
})
export class AdminResumesComponent implements OnInit {
  students: Student[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStudents();
  }

  fetchStudents() {
    this.loading = true;
    this.http.get<Student[]>('http://localhost:3000/admin/resumes').subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching resumes:', err);
        this.loading = false;
      }
    });
  }

  viewResume(student: Student) {
    if (student.resumeUrl) {
      window.open(student.resumeUrl, '_blank');
    } else {
      alert(`No resume found for ${student.name}`);
    }
  }
}
