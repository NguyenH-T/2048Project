import { Component, ViewEncapsulation } from '@angular/core';
import { TileComponent } from './tile/tile.component';

class TileData {
  id: number;
  value: number;
  positionId: number;
  
  constructor(_id: number, _value: number, _positionId: number) {
    this.id = _id
    this.value = _value
    this.positionId = _positionId
  }
}

@Component({
  selector: 'app-game',
  standalone: true,
  host: {
    '(document:keydown)' : 'keyDownHandler($event)'
  },
  imports: [ TileComponent ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  possiblePositions = ['top: 0; left: 0;', 'top: 0; left: 22.5%;']
  tileId = 0
  tiles = [new TileData(0, 2, 0), new TileData(1, 2, 1)]

  keyDownHandler(event: KeyboardEvent) {
    let key = event.key
    switch (event.key) {
      case ('ArrowUp'):
        event.preventDefault()
        break
      case ('ArrowDown'):
        event.preventDefault()
        break
      case ('ArrowLeft'):
        event.preventDefault()
        break
      case ('ArrowRight'):
        event.preventDefault()
        break
    }
  }
}
