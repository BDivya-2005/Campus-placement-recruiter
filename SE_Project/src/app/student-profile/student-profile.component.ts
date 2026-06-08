import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface StudentProfile {
  name: string;
  email: string;
  branch: string;
  skills: string[];
  phone: string;
  address: string;
  linkedIn: string;
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css'],
})
export class StudentProfileComponent implements OnInit {
  profile: StudentProfile = {
    name: '',
    email: '',
    branch: '',
    skills: [],
    phone: '',
    address: '',
    linkedIn: ''
  };

  editMode: boolean = false;
  userId: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = storedId;
      this.fetchProfile(storedId);
    }
  }

  fetchProfile(userId: string) {
    this.http.get<StudentProfile>(`http://localhost:3000/student/profile/${userId}`)
      .subscribe({
        next: (res) => {
          if (res) {
            this.profile = res;
          }
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
          console.log('No profile found, you can create a new one.');
        }
      });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  saveProfile() {
    if (!this.userId) {
      alert('User ID not found!');
      return;
    }

    this.http.post(`http://localhost:3000/student/profile/${this.userId}`, this.profile)
      .subscribe({
        next: () => {
          alert('Profile saved successfully!');
          this.editMode = false;
        },
        error: (err) => {
          alert('Error saving profile');
          console.error(err);
        }
      });
  }

  onSkillsChange(event: string) {
    this.profile.skills = event
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
  }
}
