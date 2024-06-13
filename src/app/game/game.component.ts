import { Component, Injectable } from '@angular/core';
import { TileComponent } from './tile/tile.component';

/*
This class represents the data for each tile. So TileComponents is only the display and 
this component controls everything else
*/
class TileData {
  id: number;
  value: number;
  combined = false
  
  constructor(_id: number, _value: number) {
    this.id = _id
    this.value = _value
  }
}
//The chance for a tile to have a value of 4 instead of 2
const chanceFor4Value = 0.25
//0 based
const dimensions = 4
const tileEquality = (element: TileData) => { return element.id === this }
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

  constructor() {
    this.createNewGame()
  }

  private spawnRandomTiles(amount: number) {
    //create a list of all empty positions
    let emptyPositions = []
    for (let i = 0; i < 16; i++) {
      if (this.tiles[i].value === 0) {
        emptyPositions.push(i)
      }
    }

    //spawn a set amount of tiles
    for (let i = 0; i < amount; i++) {
      let chosenIndex = Math.floor(Math.random() * emptyPositions.length)
      let value = Math.random() < chanceFor4Value ? 4 : 2;
      this.tiles[emptyPositions[chosenIndex]] = new TileData(this.tileId++, value)
      emptyPositions.splice(chosenIndex, 1)
    }
  }

  /*
  Empty Tiles. Spawn 2 new tiles
  */
  createNewGame() {
    this.tileId = 0
    this.tiles = []
    for (let i = 0; i < 16; i++) {
      this.tiles.push(new TileData(this.tileId++, 0))
    }
    this.spawnRandomTiles(2)
  }

  moveTileHorizontal() {
    let endpoint: TileData[] = this.tiles.map((e) => { return new TileData(e.id, e.value) })
    let animations = new Map()
    //loop through columns
    for (let r = 0; r < dimensions; r++) {
      //loop through row. Since this is a single dimension array mimicing a 2d array the formula is 4 * row + column
      for (let c = dimensions * r + 1; c < dimensions * r + dimensions; c++) {
        //finding the tiles from left -> right
        if (endpoint[c].value > 0) {
          //finding the tiles from right -> left
          for (let i = c - 1; i >= dimensions * r; i--) { 
            if (i == dimensions * r) { //checking if we hit the bounding box
              let temp = endpoint[i]
              endpoint[i] = endpoint[c]
              endpoint[c] = temp
            }
            else if (endpoint[i].value > 0) { //checking for occupied tile
              //combine the tiles
              if (endpoint[i].value === endpoint[c].value) {
                endpoint[i].value += endpoint[c].value
                endpoint[c] = new TileData(this.tileId, 0)
                //------------ TODO: add to animation
              }
              else {
                //can't combine. Then move to the next slot to the right
                //Empty slots is mock TileData so we can swap them
                let temp = endpoint[i + 1]
                endpoint[i + 1] = endpoint[c]
                endpoint[c] = temp
                //---------- TODO: add to animation map
              }
            }
          }
        }
      }
    }
    this.tiles = endpoint
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
        this.moveTileHorizontal()
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
