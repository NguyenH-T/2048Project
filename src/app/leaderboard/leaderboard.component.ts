import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Score } from '../Database-API-Service.component';
import { LeaderboardCellComponent } from './leaderboard-cell/leaderboard-cell.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [LeaderboardCellComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {
  @Input({ required: true }) scores = new Array<Score>()
  @Input({ required: true }) showLeaderboard = false
  @Output() showLeaderboardChange = new EventEmitter()

  backgroundClickHandler() {
    this.showLeaderboardChange.emit()
  }
}
