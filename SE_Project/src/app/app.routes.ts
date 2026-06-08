import { Routes } from '@angular/router';

// 🔐 Authentication
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// 🎓 Student Components
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { StudentJobsComponent } from './student-jobs/student-jobs.component';
import { StudentQuestionsComponent } from './student-questions/student-questions.component';
import { StudentResumeComponent } from './student-resume/student-resume.component';

// 🏢 Company Components
import { CompanyDashboardComponent } from './company-dashboard/company-dashboard.component';
import { CompanyJobsComponent } from './company-jobs/company-jobs.component';
import { CompanyStudentsComponent } from './company-students/company-students.component';
import { CompanyResumesComponent } from './company-resumes/company-resumes.component';
import { AddQuestionsComponent } from './add-questions/add-questions.component'; // ✅ new import

// 👑 Admin Components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminReportsComponent } from './admin-reports/admin-reports.component';
import { AdminResumesComponent } from './admin-resumes/admin-resumes.component';

export const routes: Routes = [
  // 🔐 Authentication Routes
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🎓 Student Routes
  { path: 'student/dashboard', component: StudentDashboardComponent },
  { path: 'student/profile', component: StudentProfileComponent },
  { path: 'student/jobs', component: StudentJobsComponent },
  { path: 'student/questions', component: StudentQuestionsComponent },
  { path: 'student/resume', component: StudentResumeComponent },

  // 🏢 Company Routes
  { path: 'company/dashboard', component: CompanyDashboardComponent },
  { path: 'company/jobs', component: CompanyJobsComponent },
  { path: 'company/students', component: CompanyStudentsComponent },
  { path: 'company/resumes', component: CompanyResumesComponent },
  { path: 'company/add-questions', component: AddQuestionsComponent }, // ✅ added cleanly

  // 👑 Admin Routes
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/users', component: AdminUsersComponent },
  { path: 'admin/reports', component: AdminReportsComponent },
  { path: 'admin/resumes', component: AdminResumesComponent },

  // 🌐 Fallback
  { path: '**', redirectTo: '' }
];
