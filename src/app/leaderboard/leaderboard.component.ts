import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DatabaseAPIService, Score } from '../Database-API-Service.component';
import { LeaderboardCellComponent } from './leaderboard-cell/leaderboard-cell.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  animations: [
    
  ],
  imports: [LeaderboardCellComponent, AsyncPipe],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {
  @Input({ required: true }) showLeaderboard = false
  @Output() showLeaderboardChange = new EventEmitter()
  scores!: Observable<Score[]>

  constructor(private api: DatabaseAPIService) {
  }

  ngOnInit() {
    if (this.scores === undefined) {
      this.scores = this.api.getAllScores() 
    }
  }

  backgroundClickHandler() {
    this.showLeaderboardChange.emit()
  }
}
