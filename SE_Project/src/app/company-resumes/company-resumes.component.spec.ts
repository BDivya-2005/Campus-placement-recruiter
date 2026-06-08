import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyResumesComponent } from './company-resumes.component';

describe('CompanyResumesComponent', () => {
  let component: CompanyResumesComponent;
  let fixture: ComponentFixture<CompanyResumesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyResumesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyResumesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
