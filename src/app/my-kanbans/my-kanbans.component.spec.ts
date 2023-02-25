import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyKanbansComponent } from './my-kanbans.component';

describe('MyKanbansComponent', () => {
  let component: MyKanbansComponent;
  let fixture: ComponentFixture<MyKanbansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyKanbansComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyKanbansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
