import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreQuestionaireComponent } from './pre-questionaire.component';

describe('PreQuestionaireComponent', () => {
  let component: PreQuestionaireComponent;
  let fixture: ComponentFixture<PreQuestionaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreQuestionaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreQuestionaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
