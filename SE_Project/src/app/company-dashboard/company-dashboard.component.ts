import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface JobPosting {
  _id: string;
  title: string;
  location: string;
  createdAt: string;
  applicants: number;
  views: number;
  status: string;
}

interface Activity {
  _id: string;
  description: string;
  createdAt: string;
}

interface ApplicantStatus {
  new: number;
  inReview: number;
  scheduled: number;
}

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css']
})
export class CompanyDashboardComponent implements OnInit {
  companyName: string = 'Company';
  companyId: string = '';

  jobPostingStats: JobPosting[] = [];
  recentActivity: string[] = [];
  applicantStatus: ApplicantStatus = { new: 0, inReview: 0, scheduled: 0 };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadCompanyInfo();
    if (this.companyId) {
      this.fetchJobs();
      this.fetchActivities();
      this.fetchApplicantStatus();
    }
  }

  loadCompanyInfo() {
    const storedData = localStorage.getItem('companyData');
    if (storedData) {
      const company = JSON.parse(storedData);
      this.companyName = company.companyName;
      this.companyId = company.companyId;
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchJobs() {
    this.http.get<JobPosting[]>(`http://localhost:3000/jobs/company/${this.companyId}`)
      .subscribe({
        next: (res) => {
          this.jobPostingStats = res.map(job => ({
            ...job,
            applicants: 0,
            views: 0,
            status: 'Open'
          }));
        },
        error: (err) => console.error('Error fetching jobs', err)
      });
  }

  fetchActivities() {
    this.http.get<Activity[]>(`http://localhost:3000/activities/${this.companyId}`)
      .subscribe({
        next: (res) => this.recentActivity = res.map(a => a.description),
        error: (err) => console.error('Error fetching activities', err)
      });
  }

  fetchApplicantStatus() {
    // Replace with real API later
    this.applicantStatus = { new: 5, inReview: 3, scheduled: 2 };
  }

  goToAddQuestions() {
    this.router.navigate(['/company/add-questions']);
  }

  logout() {
    localStorage.removeItem('companyToken');
    localStorage.removeItem('companyData');
    this.router.navigate(['/login']);
  }
}
