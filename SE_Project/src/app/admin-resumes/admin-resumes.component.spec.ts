import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResumesComponent } from './admin-resumes.component';

describe('AdminResumesComponent', () => {
  let component: AdminResumesComponent;
  let fixture: ComponentFixture<AdminResumesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminResumesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminResumesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
