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
  possiblePositions = [
    'top: 0; left: 0;', 'top: 0; left: 26%;', 'top: 0; left: 52%;', 'top: 0; left: 78%;',
    'top: 26%; left: 0;', 'top: 26%; left: 26%', 'top: 26%; left: 52%;', 'top: 26%; left: 78%;',
    'top: 52%; left: 0;', 'top: 52%; left: 26%', 'top: 52%; left: 52%;', 'top: 52%; left: 78%;',
    'top: 78%; left: 0;', 'top: 78%; left: 26%', 'top: 78%; left: 52%;', 'top: 78%; left: 78%;'
  ]
  tileId = 0
  //tiles = [new TileData(0, 2, 0), new TileData(1, 2, 1), new TileData(2, 2, 2), new TileData(3, 2, 3)]
  tiles = this.fillTiles()
    
  fillTiles() {
    let array = []
    for (let i = 0; i < 16; i++) {
      array.push(new TileData(i, 2, i))
    }
    return array
  }

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
