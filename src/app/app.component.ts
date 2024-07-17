import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent, GameMoveEvent } from './game/game.component';
import { Observable, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  @ViewChild(GameComponent) game!: GameComponent
  time = 0
  score = 0
  timerSub! : Subscription | undefined
  firstMove = true

  tileMoveHandler(event: GameMoveEvent) {
    if (this.firstMove) {
      this.firstMove = false
      this.timerSub = timer(0, 1000).subscribe(() => {this.time++})
    }
    this.score += event.points
    //TODO: add score to HTML
  }

  getTime() {
    if (this.time < 3600) {
      return new Date(this.time * 1000).toISOString().slice(14, 19)
    }
    return '60:00'
  }

  newGameHandler() {
    this.game.createNewGame()
    this.score = 0
    this.firstMove = true
    this.time = 0
    if (this.timerSub !== undefined) {
      this.timerSub.unsubscribe()
    }
  }
}
