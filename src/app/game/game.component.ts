import { Component, EventEmitter, inject, Injectable, Output } from '@angular/core';
import { TileComponent } from './tile/tile.component';
import { PositionIndex } from './tile-movement.component';

interface TileMovement {
  points: number,
  changed: boolean
}

export interface GameMoveEvent {
  points: number
}

/*
This class represents the data for each tile. So TileComponents is only the display and 
this component controls everything else
*/
export class TileData {
  id: number
  value: number
  pos: PositionIndex
  distance: number = 0
  combined = false
  deleted = false
  spawn = false
  
  constructor(_id: number, _value: number, _pos: PositionIndex) {
    this.id = _id
    this.value = _value
    this.pos = _pos
  }
}
//The chance for a tile to have a value of 4 instead of 2
const chanceFor4Value = 0.10
const SPAWN_AMOUNT = 1
export const DIMENSIONS : number = 4

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-game',
  standalone: true,
  host: {
    '(document:keydown)': 'keyDownHandler($event)',
  },
  imports: [ TileComponent ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  //Unique id for each TileData
  tileId = 0
  tiles: Map<number, TileData> = new Map<number, TileData>()
  gameFail = false
  @Output() tileMoved = new EventEmitter()
  @Output() gameIsOver = new EventEmitter()

  constructor() {
    this.tileId = this.spawnRandomTiles(2, this.tiles, this.tileId)
  } 


  /*
  Given a tile Map find all of the positions that have not been occupied by a tile.
  */
  findEmptyPositions(tiles: Map<number, TileData>) : PositionIndex[] {
    let emptyPos: PositionIndex[] = []

    for (let i = 0; i < DIMENSIONS; i++) {
      for (let j = 0; j < DIMENSIONS; j++) {
        let found = false

        //find any tile that has the position (i, j)
        for (let tile of tiles.values()) {
          if (tile.pos.row === i && tile.pos.col === j) {
            found = true
            break
          }
        } 
        if (!found) { //add to array if the position wasn't found
          emptyPos.push({row: i, col: j})
        }
      }
    }
    return emptyPos
  }

  /*
  Spawns a set amount of tiles into the Tiles map
  */
  spawnRandomTiles(amount: number, tiles: Map<number, TileData>, id: number) : number {
    //create a list of all empty positions
    let emptyPos = this.findEmptyPositions(tiles)

    //spawn a set amount of tiles
    for (let i = 0; i < amount && emptyPos.length > 0; i++) {
      let chosenEmpty = Math.floor(Math.random() * emptyPos.length)
      let value = Math.random() < chanceFor4Value ? 4 : 2;
      let pos = emptyPos[chosenEmpty]
      let newTile = new TileData(id++, value, pos)
      newTile.spawn = true
      tiles.set(id, newTile)
        
      emptyPos.splice(chosenEmpty, 1)
    }
    return id
  }

  /*
  Create a new game state
  */
  createNewGame() {
    let newTiles = new Map<number, TileData>()
    this.tileId = this.spawnRandomTiles(2, newTiles, this.tileId)
    this.tiles = newTiles
    this.gameFail = false
  }

  /*
  Create a copy of a given Tiles map with deleted tiles removed. This copy is a shallow copy.
  */
  copyAndFilterTiles(tiles: Map<number, TileData>) {
    let copy = new Map<number, TileData>()
    for (let tile of tiles.values()) {
      if (!tile.deleted) {
        tile.combined = false
        copy.set(tile.id, tile)
      }
    }
    return copy
  }


  /*
  Given two tiles check whether they are combinable

  Combinable if two conditions are met:
  - both tiles are the same value
  - neither tile has already been combined
  */
  private checkCombine(combiner: TileData | undefined, combinee: TileData | undefined, ignoreAlreadyCombined? : boolean) : boolean {
    if (combinee !== undefined && combiner !== undefined) {
      if ((combinee.combined || combiner.combined) && ignoreAlreadyCombined === false) {
        return false
      }
      else if (combiner.id !== combinee.id && combiner.value === combinee.value) {
        return true
      }
    }
    return false
  }

  /*
  Creates a 2d array matrix of a given tile where each tiles' position is mapped to that matrix with it's id
  */
  mapToMatrix(tiles: Map<number, TileData>): number[][] {
    let matrix: number[][] = new Array(DIMENSIONS)
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(DIMENSIONS).fill(-1)
    }
    
    for (let tile of tiles.values()) {
      matrix[tile.pos.row][tile.pos.col] = tile.id
    }
    return matrix
  }

  /*
  For each tile check it's adjacent tile to it's right and below for a valid move

  Valid moves include:
  - can be combined
  - empty position
  */
  checkGameFail(posMap: number[][], tiles: Map<number, TileData>) : boolean {
    for (let i = 0; i < posMap.length; i++) {
      for (let j = 0; j < posMap[i].length; j++) {
        if (posMap[i][j] < 0) { //edge case where the top left position can be an empty slot
          return false
        }
        if (i + 1 < posMap.length) {
          if (posMap[i + 1][j] < 0) {
            return false
          }
          else if (this.checkCombine(tiles.get(posMap[i][j]), tiles.get(posMap[i + 1][j]), true)) {
            return false
          }
        }
        if (j + 1 < posMap[i].length) {
          if (posMap[i][j + 1] < 0) {
            return false
          }
          else if (this.checkCombine(tiles.get(posMap[i][j]), tiles.get(posMap[i][j + 1]), true)) {
            return false
          }
        }
      }
    }
    return true
  }

  /*
  Searches the posMatrix starting from the (sRow, sCol) then increment (iRow, iCol).
  When going back up the stack after hitting the playfield bound, update the tiles map according to the newly calculated values.
  moveData is populated with the total score accumulated for the movement.
  */
  moveTilesRecurse(sRow: number, sCol: number, iRow: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>, moveData : TileMovement): PositionIndex {
    if (sCol >= DIMENSIONS || sRow >= DIMENSIONS || sCol < 0 || sRow < 0) { //Hit one of either horizontal or vertical bound
      if (sCol >= DIMENSIONS || sCol < 0) { //hit vertical
        return {row: sRow, col: sCol - iCol}
      }
      else { //hit horizontal
        return {row: sRow - iRow, col: sCol}
      }
    }
    else {
      let outcome = this.moveTilesRecurse(sRow + iRow, sCol + iCol, iRow, iCol, posMatrix, tiles, moveData)
      if (posMatrix[sRow][sCol] >= 0) { //current is occupied slot
        if (posMatrix[outcome.row][outcome.col] < 0) { //if the outcome was an empty slot. As in the last item was the bound
          let data = tiles.get(posMatrix[sRow][sCol])
          if (data !== undefined) { //set the current occupied slot to position of the bound
            data.pos = outcome
          }

          return { row: sRow, col: sCol }
        }
        else {
          let current = tiles.get(posMatrix[sRow][sCol])
          let search = tiles.get(posMatrix[outcome.row][outcome.col])
          if (current !== undefined && search !== undefined) {
            if (this.checkCombine(current, search)) { //Combinable
              search.combined = true
              search.value *= 2
              current.pos.row = search.pos.row
              current.pos.col = search.pos.col
              current.deleted = true

              moveData.points += search.value
              return outcome
            }
            else if(current.id !== search.id) { //not combinable
              current.pos.row = search.pos.row - iRow
              current.pos.col = search.pos.col - iCol
              
              return { row: sRow, col: sCol }
            }
          }
        }
      }
      return outcome
    }
  }

  /*
  driver function for moveTilesRecurse() where the driver moves row-by-row
  
  sCol - starting column to search from
  iCol - increment from starting column by amount (this can be negative)
  */
  moveTilesHorizontal(sCol: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>): TileMovement {
    let original = new Map<number, PositionIndex>()
    for (let tile of tiles.values()) { //create a map of <id, positions>
      original.set(tile.id, {row: tile.pos.row, col: tile.pos.col })
    }

    let score = {points: 0, changed: false}
    for (let r = 0; r < DIMENSIONS; r++) {
      this.moveTilesRecurse(r, sCol, 0, iCol, posMatrix, tiles, score)
    }

    for (let mem of original.entries()) { //for every tile that check if it's position has changed.
      let tile = tiles.get(mem[0])
      if (tile !== undefined) {
        if (tile.pos.row != mem[1].row || tile.pos.col != mem[1].col) {
          score.changed = true
        }
      }
    }

    return score
  }

  /*
  driver function for moveTilesRecurse() where the driver moves column-by-column

  sRow - starting row to search from
  iRow - increment from starting row by amount (this can be negative)
  */
  moveTilesVertical(sRow: number, iRow: number, posMatrix: number[][], tiles: Map<number, TileData>): TileMovement {
    let original = new Map<number, PositionIndex>()
    for (let tile of tiles.values()) { //create a map of <id, positions>
      original.set(tile.id, {row: tile.pos.row, col: tile.pos.col })
    }

    let score = {points: 0, changed: false}
    for (let c = 0; c < DIMENSIONS; c++) {
      this.moveTilesRecurse(sRow, c, iRow, 0, posMatrix, tiles, score)
    }

    for (let mem of original.entries()) { //for every tile check if its position has changed
      let tile = tiles.get(mem[0])
      if (tile !== undefined) {
        if (tile.pos.row != mem[1].row || tile.pos.col != mem[1].col) {
          score.changed = true
        }
      }
    }

    return score
  }

  keyDownHandler(event: KeyboardEvent) {
    if (!this.gameFail) {
      let updatedTiles: Map<number, TileData>
      let posMatrix: number[][]
      let moveData: TileMovement
      switch (event.key) {
        case ('ArrowUp'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)

          if (this.checkGameFail(posMatrix, updatedTiles)) {
            this.gameFail = true
            this.gameIsOver.emit()
          }
          else {
            moveData = this.moveTilesVertical(DIMENSIONS - 1, -1, posMatrix, updatedTiles)
            if (moveData.changed) {
              this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)
              this.tiles = updatedTiles
              this.tileMoved.emit({ points: moveData.points })
            }
          }
          event.preventDefault()
          break
        case ('ArrowDown'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)

          if (this.checkGameFail(posMatrix, updatedTiles)) {
            this.gameFail = true
            this.gameIsOver.emit()
          }
          else {
            moveData = this.moveTilesVertical(0, 1, posMatrix, updatedTiles)
            if (moveData.changed) {
              this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId) 
              this.tiles = updatedTiles
              this.tileMoved.emit({ points: moveData.points })
            }
          }
          event.preventDefault()
          break
        case ('ArrowLeft'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)

          if (this.checkGameFail(posMatrix, updatedTiles)) {
            this.gameFail = true
            this.gameIsOver.emit()
          }
          else {
            moveData = this.moveTilesHorizontal(DIMENSIONS - 1, -1, posMatrix, updatedTiles)
            if (moveData.changed) {
              this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)
              this.tiles = updatedTiles
              this.tileMoved.emit({ points: moveData.points })
            }
          }
          event.preventDefault()
          break
        case ('ArrowRight'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)
        
          if (this.checkGameFail(posMatrix, updatedTiles)) {
            this.gameFail = true
            this.gameIsOver.emit()
          }
          else {
            moveData = this.moveTilesHorizontal(0, 1, posMatrix, updatedTiles)
            if (moveData.changed) {
              this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)
              this.tiles = updatedTiles
              this.tileMoved.emit({ points: moveData.points })
            }
          }

          event.preventDefault()
          break
      }
    }
  }
}
