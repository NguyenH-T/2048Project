import { Component, Injectable, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent, GameMoveEvent } from './game/game.component';
import { Observable, Subscription, timer } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatabaseAPIService, Score } from './Database-API-Service.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

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
  imports: [RouterOutlet, GameComponent, LeaderboardComponent],
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
  leaderboardScores = new Array<Score>()
  showLeaderboard = false

  constructor(private api: DatabaseAPIService) {

  }

  /*
  every time a tile moves add to points. If the first time a tile has moved, start the timer.
  */
  tileMoveHandler(event: GameMoveEvent) {
    if (this.firstMove) {
      this.firstMove = false
      this.timerSub = timer(0, 1000).subscribe(() => {this.time++})
    }
    this.score += event.points
  }

  /*
  formats the current time that has elapsed
  */
  getTime() {
    if (this.time < 3600) {
      return new Date(this.time * 1000).toISOString().slice(14, 19)
    }
    return '+60:00'
  }

  /*
  when the game ends stop the timer, and display the lost screen.
  */
  gameEndHandler() {
    if (this.timerSub !== undefined) {
      this.timerSub.unsubscribe()
    }
    timer(500).subscribe(() => {
      this.gameLost = true
    })
  }

  /*
  creates a new game state
  */
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

  showLeaderboardHandler() {
    this.showLeaderboard = true
  }

  submitLeaderboardHandler() {
    console.log('clicked')
    //TODO Database Integration
  }

  //debugging function
  keyDownHandler(event: KeyboardEvent) {
    // //This is to pull up game end screen for testing
    // if (event.key == ' ') {
    //   this.gameLost = true
    //   event.preventDefault()
    // }
  }
}
