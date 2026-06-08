import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface StudentResume {
  _id: string;
  name: string;
  email: string;
  branch: string;
  skills?: string[];
  resumeFile?: string;
}

@Component({
  selector: 'app-company-resumes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './company-resumes.component.html',
  styleUrls: ['./company-resumes.component.css']
})
export class CompanyResumesComponent implements OnInit {
  studentResumes: StudentResume[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchResumes();
  }

  // ✅ Fetch student resumes from company endpoint
  fetchResumes() {
    this.loading = true;
    this.http.get<StudentResume[]>('http://localhost:3000/api/company/resumes').subscribe({
      next: (data) => {
        this.studentResumes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching resumes:', err);
        this.loading = false;
      }
    });
  }

  // ✅ Open the uploaded resume in a new tab (like admin)
  viewResume(student: StudentResume) {
  if (!student.resumeFile) {
    alert(`No resume found for ${student.name}`);
    return;
  }

  // Check if resumeFile already includes full URL
  let fileUrl = student.resumeFile.startsWith('http')
    ? student.resumeFile
    : `http://localhost:3000/uploads/${student.resumeFile}`;

  window.open(fileUrl, '_blank');
}

}
