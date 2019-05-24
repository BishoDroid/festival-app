import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KimaThankyouComponent } from './kima-thankyou.component';

describe('KimaThankyouComponent', () => {
  let component: KimaThankyouComponent;
  let fixture: ComponentFixture<KimaThankyouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KimaThankyouComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KimaThankyouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
