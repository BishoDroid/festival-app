import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostQuestionaireComponent } from './post-questionaire.component';

describe('PostQuestionaireComponent', () => {
  let component: PostQuestionaireComponent;
  let fixture: ComponentFixture<PostQuestionaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostQuestionaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostQuestionaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
