import { Component, Input } from '@angular/core';
import { Score } from '../../Database-API-Service.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent {
  @Input({ required: true }) scores = new Array<Score>()
}
