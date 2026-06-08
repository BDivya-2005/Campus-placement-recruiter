import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Question {
  _id: string;
  title: string;
  difficulty: string;
}

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-questions.component.html',
  styleUrls: ['./add-questions.component.css']
})
export class AddQuestionsComponent implements OnInit {
  questionTitle = '';
  questionDifficulty = '';
  successMsg = '';

  questions: Question[] = [];
  isEditing = false;
  editIndex: number | null = null;

  companyId = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const storedData = localStorage.getItem('companyData');
    if (!storedData) {
      alert('Company not logged in!');
      return;
    }
    const company = JSON.parse(storedData);
    this.companyId = company.companyId;

    this.loadQuestions();
  }

  loadQuestions() {
    this.http.get<Question[]>(`http://localhost:3000/questions/company/${this.companyId}`)
      .subscribe({
        next: res => this.questions = res,
        error: err => console.error(err)
      });
  }

  addQuestion() {
    if (!this.questionTitle || !this.questionDifficulty) {
      alert('Please fill all fields');
      return;
    }

    const payload = {
      title: this.questionTitle,
      difficulty: this.questionDifficulty,
      companyId: this.companyId
    };

    if (this.isEditing && this.editIndex !== null) {
      const questionId = this.questions[this.editIndex]._id;
      this.http.put(`http://localhost:3000/questions/update/${questionId}`, payload)
        .subscribe({
          next: (res: any) => {
            this.questions[this.editIndex!] = { ...this.questions[this.editIndex!], ...payload };
            this.resetForm();
          },
          error: err => console.error(err)
        });
    } else {
      this.http.post(`http://localhost:3000/questions/add`, payload)
        .subscribe({
          next: (res: any) => {
            this.questions.unshift(res.question);
            this.resetForm();
          },
          error: err => console.error(err)
        });
    }
  }

  editQuestion(index: number) {
    this.isEditing = true;
    this.editIndex = index;
    this.questionTitle = this.questions[index].title;
    this.questionDifficulty = this.questions[index].difficulty;
  }

  deleteQuestion(index: number) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const questionId = this.questions[index]._id;
    this.http.delete(`http://localhost:3000/questions/delete/${questionId}`)
      .subscribe({
        next: () => this.questions.splice(index, 1),
        error: err => console.error(err)
      });
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.isEditing = false;
    this.editIndex = null;
    this.questionTitle = '';
    this.questionDifficulty = '';
    this.successMsg = this.isEditing ? '' : 'Question added successfully!';
  }
}
