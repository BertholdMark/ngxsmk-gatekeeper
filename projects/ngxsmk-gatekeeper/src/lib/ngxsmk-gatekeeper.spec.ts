import 'zone.js';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxsmkGatekeeper } from './ngxsmk-gatekeeper';

describe('NgxsmkGatekeeper', () => {
  let component: NgxsmkGatekeeper;
  let fixture: ComponentFixture<NgxsmkGatekeeper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsmkGatekeeper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxsmkGatekeeper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
