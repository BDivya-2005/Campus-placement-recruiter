import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Job {
  _id: string;
  title: string;
  companyName: string;
  companyId: string;
  location: string;
}

@Component({
  selector: 'app-student-jobs',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './student-jobs.component.html',
  styleUrls: ['./student-jobs.component.css']
})
export class StudentJobsComponent implements OnInit {
  jobs: Job[] = [];
  studentId: string = '';
  role: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.studentId = localStorage.getItem('userId') || '';
    this.role = localStorage.getItem('userRole') || '';

    if (!this.studentId || this.role !== 'student') {
      alert('Please login as a student to view available jobs');
      return;
    }

    this.fetchAllJobs();
  }

  fetchAllJobs() {
    this.http.get<Job[]>('http://localhost:3000/jobs/all').subscribe({
      next: (jobs) => (this.jobs = jobs),
      error: (err) => {
        console.error('Error fetching jobs', err);
        alert('Failed to fetch jobs');
      }
    });
  }

  apply(job: Job) {
    this.http.post('http://localhost:3000/jobs/apply', {
      studentId: this.studentId,
      jobId: job._id,
      companyId: job.companyId
    }).subscribe({
      next: (res: any) => alert(res.message || 'Applied successfully!'),
      error: (err) => alert(err.error?.message || 'Failed to apply')
    });
  }
}
