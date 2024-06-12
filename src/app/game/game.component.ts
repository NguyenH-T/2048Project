import { Component, Injectable } from '@angular/core';
import { TileComponent } from './tile/tile.component';

/*
This class represents the data for each tile. So TileComponents is only the display and 
this component controls everything else
*/
class TileData {
  id: number;
  value: number;
  positionId: number;
  combined = false
  
  constructor(_id: number, _value: number, _positionId: number) {
    this.id = _id
    this.value = _value
    this.positionId = _positionId
  }
}
//The chance for a tile to have a value of 4 instead of 2
const chanceFor4Value = 0.25
//0 based
const dimensions = 3
const tileEquality = (element: TileData) => { return element.id === this }
const tilePositionEquality = (element: TileData) => { return element.positionId == this }
const forward = 1, backwards = -1

@Injectable({
  providedIn: 'root'
})
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
  //Const of all positions in the grid
  possiblePositions = [
    'top: 0; left: 0;', 'top: 0; left: 26%;', 'top: 0; left: 52%;', 'top: 0; left: 78%;',
    'top: 26%; left: 0;', 'top: 26%; left: 26%', 'top: 26%; left: 52%;', 'top: 26%; left: 78%;',
    'top: 52%; left: 0;', 'top: 52%; left: 26%', 'top: 52%; left: 52%;', 'top: 52%; left: 78%;',
    'top: 78%; left: 0;', 'top: 78%; left: 26%', 'top: 78%; left: 52%;', 'top: 78%; left: 78%;'
  ]
  //Unique id for each TileData
  tileId = 0
  tiles: TileData[] = []

  ngOnInit() {
    this.createNewGame()
  }

  private spawnRandomTiles(amount: number) {
    //create a list of all empty positions
    let emptyPositions = []
    for (let i = 0; i < 16; i++) {
      if (this.tiles.findIndex(tileEquality, i) < 0) {
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

  /*
  Empty Tiles. Spawn 2 new tiles
  */
  createNewGame() {
    this.tileId = 0
    this.tiles = []
    this.spawnRandomTiles(2)
  }

  moveTilesHorizontal() {
    //Create copy to avoid mutation
    let endPoint = this.tiles.map((e) : TileData => { return new TileData(e.id, e.value, e.positionId) })
    for (let r = 0; r < dimensions; r++) {
      for (let c = 4 * r + 1; c < dimensions; c++) {
        for (let s = c - 1; s >= 0; s--) {
          //Check for the first tile located on the left side of the current tile
          let firstFound = endPoint.findIndex(tilePositionEquality, s)
          if (firstFound > 0) {
            //Check to see if combinable
            if (endPoint[firstFound].value === endPoint[c].value) {
              //Combine values. Move both tiles onto the same position. Mark one of them to be deleted.
              endPoint[firstFound].value += endPoint[c].value
              endPoint[c].combined = true
              endPoint[c].positionId = endPoint[firstFound].positionId
            }
            else {
              //Move to the next leftmost position
              endPoint[c].positionId = s + 1
            }
          }
          else {
            //if tile is not found then move current tile to that position
            endPoint[c].positionId = s
          }
        }
      }
    }
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
      case (' '):
        this.spawnRandomTiles(2)
        event.preventDefault()
        break
    }
  }
}
