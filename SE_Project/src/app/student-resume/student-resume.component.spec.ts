import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentResumeComponent } from './student-resume.component';

describe('StudentResumeComponent', () => {
  let component: StudentResumeComponent;
  let fixture: ComponentFixture<StudentResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
