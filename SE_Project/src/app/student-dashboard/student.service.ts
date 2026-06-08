import { Injectable } from '@angular/core';

export interface StudentProfile {
  name: string;
  email: string;
  branch: string;
  skills: string[];
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
}

export interface Question {
  id: number;
  title: string;
  difficulty: string;
  topic: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private jobs: Job[] = [
    { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', description: 'Work with Angular' },
    { id: 2, title: 'Backend Engineer', company: 'SoftServe', location: 'Chennai', description: 'Node.js, MongoDB' },
    { id: 3, title: 'Intern – ML', company: 'AIWorks', location: 'Bangalore', description: 'Python & TensorFlow' }
  ];

  private questions: Question[] = [
    { id: 1, title: 'Explain closures in JS', difficulty: 'Medium', topic: 'JavaScript' },
    { id: 2, title: 'What is normalization?', difficulty: 'Easy', topic: 'DBMS' },
    { id: 3, title: 'Describe backpropagation', difficulty: 'Hard', topic: 'ML' }
  ];

  getJobs(): Job[] {
    return this.jobs;
  }

  applyJob(id: number): void {
    alert(`Applied to job ID ${id} successfully!`);
  }

  getQuestions(): Question[] {
    return this.questions;
  }
}
