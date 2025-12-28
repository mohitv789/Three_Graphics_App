import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorSidebar } from './editor-sidebar';

describe('EditorSidebar', () => {
  let component: EditorSidebar;
  let fixture: ComponentFixture<EditorSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditorSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
