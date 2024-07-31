import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardCellComponent } from './leaderboard-cell.component';

describe('LeaderboardCellComponent', () => {
  let component: LeaderboardCellComponent;
  let fixture: ComponentFixture<LeaderboardCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
