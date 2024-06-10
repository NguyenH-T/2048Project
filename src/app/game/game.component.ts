import { Component, ViewEncapsulation } from '@angular/core';
import { TileComponent } from './tile/tile.component';
import { empty } from 'rxjs';

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
const chanceFor4Value = 0.25

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
  tiles: TileData[] = []
  
  /*
    Given a position to search for, find if it is already occupied
  */
  findTile(search: number) : boolean {
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i].positionId == search) {
        return true
      }
    }
    return false
  }


  spawnRandomTiles(amount: number) {
    //create a list of all empty positions
    let emptyPositions = []
    for (let i = 0; i < 16; i++) {
      if (!this.findTile(i)) {
        emptyPositions.push(i)
      }
    }

    //spawn a set amount of tiles
    for (let i = 0; i < amount; i++) {
      let chosenIndex = Math.floor(Math.random() * emptyPositions.length)
      let value = Math.random() < chanceFor4Value ? 4 : 2;
      this.tiles.push(new TileData(this.tileId++, value, emptyPositions[chosenIndex]))
      emptyPositions.splice(chosenIndex, 1)
    }
  }

  keyDownHandler(event: KeyboardEvent) {
    let key = event.key
    switch (event.key) {
      case ('ArrowUp'):
        this.spawnRandomTiles(2)
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
