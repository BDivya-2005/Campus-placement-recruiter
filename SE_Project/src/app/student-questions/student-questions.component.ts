import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Question {
  _id: string;
  title: string;
  difficulty: string;
  companyName: string;
}

@Component({
  selector: 'app-student-questions',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './student-questions.component.html',
  styleUrls: ['./student-questions.component.css']
})
export class StudentQuestionsComponent implements OnInit {
  questions: Question[] = [];
  groupedQuestions: { company: string, questions: Question[] }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchQuestions();
  }

  fetchQuestions() {
    this.http.get<Question[]>(`http://localhost:3000/questions/all-with-company`)
      .subscribe({
        next: (data) => {
          this.questions = data;

          // Group questions by company
          const map: { [key: string]: Question[] } = {};
          this.questions.forEach(q => {
            if (!map[q.companyName]) map[q.companyName] = [];
            map[q.companyName].push(q);
          });

          this.groupedQuestions = Object.keys(map).map(company => ({
            company,
            questions: map[company]
          }));
        },
        error: (err) => console.error(err)
      });
  }
}
