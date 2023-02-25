import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolderDialogComponent } from './holder-dialog.component';

describe('HolderDialogComponent', () => {
  let component: HolderDialogComponent;
  let fixture: ComponentFixture<HolderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
