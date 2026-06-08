import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-resume',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './student-resume.component.html',
  styleUrls: ['./student-resume.component.css']
})
export class StudentResumeComponent implements OnInit {
  selectedFile: File | null = null;
  uploadedFileName: string = '';
  userId: string = '';
  uploadProgress: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = storedId;
      this.fetchResume(); // fetch existing resume if available
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf') {
        alert('⚠️ Only PDF files are allowed!');
        return;
      }
      this.selectedFile = file;
    }
  }

  uploadResume() {
    if (!this.selectedFile || !this.userId) {
      alert('⚠️ Select a PDF file first!');
      return;
    }

    const formData = new FormData();
    formData.append('resume', this.selectedFile);
    formData.append('studentId', this.userId);

    this.http.post<{ resumeUrl: string }>(
      `http://localhost:3000/student/upload-resume`,
      formData,
      { reportProgress: true, observe: 'events' }
    ).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event.type === HttpEventType.Response) {
          // show only file name
          this.uploadedFileName = this.selectedFile!.name;
          this.selectedFile = null;
          this.uploadProgress = 0;
          alert(`✅ Resume "${this.uploadedFileName}" uploaded successfully!`);
        }
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error uploading resume!');
      }
    });
  }

  fetchResume() {
  if (!this.userId) return;

  this.http.get<{ filename: string }>(
    `http://localhost:3000/student/resume/${this.userId}`
  ).subscribe({
    next: (res) => {
      this.uploadedFileName = res.filename; // last uploaded file name
    },
    error: () => {
      console.log('No existing resume found.');
    }
  });
}

}
