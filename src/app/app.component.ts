import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent, GameMoveEvent } from './game/game.component';
import { Observable, Subscription, timer } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  animations: [
    trigger('gameState', [
      transition(':enter', [
        style({
          opacity: 0.0
        }),
        animate('500ms', 
          style({
            opacity: 0.9
          })
        )
      ]),
      transition(':leave',
        animate('500ms', 
          style({
            opacity: 0.0
          })
        )
      )
    ])
  ],
  host: {
    '(document:keydown)': 'keyDownHandler($event)',
  },
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
  gameLost = false

  tileMoveHandler(event: GameMoveEvent) {
    if (this.firstMove) {
      this.firstMove = false
      this.timerSub = timer(0, 1000).subscribe(() => {this.time++})
    }
    this.score += event.points
  }

  getTime() {
    if (this.time < 3600) {
      return new Date(this.time * 1000).toISOString().slice(14, 19)
    }
    return '+60:00'
  }

  gameEndHandler() {
    if (this.timerSub !== undefined) {
      this.timerSub.unsubscribe()
    }
    timer(1000).subscribe(() => {
      this.gameLost = true
    })
  }

  newGameHandler() {
    this.score = 0
    this.firstMove = true
    this.time = 0
    if (this.timerSub !== undefined) {
      this.timerSub.unsubscribe()
    }
    this.gameLost = false
    timer(500).subscribe(() => {
      this.game.createNewGame()
    })
  }

  submitLeaderboardHandler() {
    console.log('clicked')
  }

  keyDownHandler(event: KeyboardEvent) {
    if (event.key == ' ') {
      this.gameLost = true
      event.preventDefault()
    }
  }
}
