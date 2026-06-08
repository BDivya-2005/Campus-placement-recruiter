import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Company {
  name: string;
  role: string;
  date?: string; // upcoming interview date, optional
}

interface Question {
  title: string;
  difficulty: string;
}

interface StudentActivity {
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  studentProfile = {
    name: 'John Doe',
    email: 'student@example.com',
    branch: 'CSE',
    year: 'Final Year',
    id: '' // will get from localStorage
  };

  companies: Company[] = [];
  interviewQuestions: Question[] = [];
  activities: StudentActivity[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.studentProfile.id = localStorage.getItem('userId') || '';
    if (this.studentProfile.id) {
      this.fetchActivities();
      this.fetchCompanies();
      this.fetchQuestions();
    }
  }

  logout() {
    console.log('User logged out');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  fetchActivities() {
    this.http.get<StudentActivity[]>(`http://localhost:3000/student/activity/${this.studentProfile.id}`)
      .subscribe({
        next: (res) => this.activities = res,
        error: (err) => console.error('Error fetching activities:', err)
      });
  }

  fetchCompanies() {
    this.http.get<Company[]>('http://localhost:3000/companies')
      .subscribe({
        next: (res) => this.companies = res,
        error: (err) => console.error('Error fetching companies:', err)
      });
  }

  fetchQuestions() {
    this.http.get<Question[]>('http://localhost:3000/questions')
      .subscribe({
        next: (res) => this.interviewQuestions = res,
        error: (err) => console.error('Error fetching questions:', err)
      });
  }
}
