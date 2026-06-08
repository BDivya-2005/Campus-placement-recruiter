import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  reports = [
    { title: 'Total Students Placed', value: 0, key: 'students' },
    { title: 'Total Jobs Posted', value: 0, key: 'jobs' },
    { title: 'Active Companies', value: 0, key: 'companies' }
  ];

  selectedReport: any = null;
  reportDetails: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReportCounts();
  }

  loadReportCounts() {
    this.http.get<any>('http://localhost:3000/admin/reports').subscribe({
      next: (data) => {
        this.reports[0].value = data.totalStudentsPlaced;
        this.reports[1].value = data.totalJobsPosted;
        this.reports[2].value = data.activeCompanies;
      },
      error: (err) => console.error('Error fetching report counts:', err)
    });
  }

  viewDetails(report: any) {
    this.selectedReport = report;
    this.loading = true;
    this.reportDetails = [];

    let url = '';

    if (report.key === 'students') url = 'http://localhost:3000/admin/reports/students';
    else if (report.key === 'jobs') url = 'http://localhost:3000/admin/reports/jobs';
    else if (report.key === 'companies') url = 'http://localhost:3000/admin/reports/companies';

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.reportDetails = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading report details:', err);
        this.loading = false;
      }
    });
  }

  closeDetails() {
    this.selectedReport = null;
    this.reportDetails = [];
  }
}
