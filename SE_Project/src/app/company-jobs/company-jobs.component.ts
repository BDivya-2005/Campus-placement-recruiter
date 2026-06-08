import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Job {
  _id: string;
  title: string;
  location: string;
}

@Component({
  selector: 'app-company-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './company-jobs.component.html',
  styleUrls: ['./company-jobs.component.css']
})
export class CompanyJobsComponent implements OnInit {
  companyId = '';
  jobs: Job[] = [];

  showForm = false;
  isEditing = false;
  editIndex: number | null = null;

  newJobTitle = '';
  newJobLocation = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const storedData = localStorage.getItem('companyData');
    if (!storedData) {
      alert('Company not logged in!');
      return;
    }
    const company = JSON.parse(storedData);
    this.companyId = company.companyId;
    this.loadJobs();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  loadJobs() {
    this.http.get<Job[]>(`http://localhost:3000/jobs/company/${this.companyId}`)
      .subscribe({
        next: res => this.jobs = res,
        error: err => console.error(err)
      });
  }

  saveJob() {
    if (!this.newJobTitle || !this.newJobLocation) return alert('Fill all fields!');

    const payload = { title: this.newJobTitle, location: this.newJobLocation, companyId: this.companyId };

    if (this.isEditing && this.editIndex !== null) {
      const jobId = this.jobs[this.editIndex]._id;
      this.http.put(`http://localhost:3000/jobs/update/${jobId}`, payload)
        .subscribe({
          next: (res: any) => {
            this.jobs[this.editIndex!] = { ...this.jobs[this.editIndex!], ...payload };
            this.resetForm();
          },
          error: err => console.error(err)
        });
    } else {
      this.http.post(`http://localhost:3000/jobs/add`, payload)
        .subscribe({
          next: (res: any) => {
            this.jobs.push(res.job);
            this.resetForm();
          },
          error: err => console.error(err)
        });
    }
  }

  editJob(index: number) {
    this.isEditing = true;
    this.editIndex = index;
    this.newJobTitle = this.jobs[index].title;
    this.newJobLocation = this.jobs[index].location;
    this.showForm = true;
  }

  deleteJob(index: number) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    const jobId = this.jobs[index]._id;
    this.http.delete(`http://localhost:3000/jobs/delete/${jobId}`)
      .subscribe({
        next: () => this.jobs.splice(index, 1),
        error: err => console.error(err)
      });
  }

  cancelJob() {
    this.resetForm();
  }

  private resetForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editIndex = null;
    this.newJobTitle = '';
    this.newJobLocation = '';
  }
}
