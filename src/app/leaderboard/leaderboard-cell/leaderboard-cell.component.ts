import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-leaderboard-cell',
  standalone: true,
  imports: [],
  templateUrl: './leaderboard-cell.component.html',
  styleUrl: './leaderboard-cell.component.css'
})
export class LeaderboardCellComponent {
  @Input({ required: true }) username = ""
  @Input({ required: true }) score = "0"
  @Input({ required: true }) time = "00:00"
}
