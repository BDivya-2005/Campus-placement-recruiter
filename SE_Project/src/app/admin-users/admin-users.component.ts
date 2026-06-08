import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface User {
  _id?: string;
  name: string;
  email: string;
  role: string;
  editing?: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  users: User[] = [];

  // 🔗 Change this URL to your backend API
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUsers();
  }

  // 🟢 Fetch users from MongoDB
  getUsers() {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        alert('Failed to load users from database!');
      }
    });
  }

  // 🟡 Edit user
  edit(user: User) {
    user.editing = true;
  }

  // 🔵 Save user updates
  save(user: User) {
    if (!user._id) return;

    this.http.put(`${this.apiUrl}/${user._id}`, user).subscribe({
      next: () => {
        user.editing = false;
        alert(`Updated ${user.name}'s details successfully!`);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        alert('Failed to update user!');
      }
    });
  }

  // 🔴 Delete user
  delete(user: User) {
    if (!user._id) return;

    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.http.delete(`${this.apiUrl}/${user._id}`).subscribe({
        next: () => {
          this.users = this.users.filter(u => u._id !== user._id);
          alert('User deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user!');
        }
      });
    }
  }
}
