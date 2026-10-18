import { TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('Sidebar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Sidebar);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
