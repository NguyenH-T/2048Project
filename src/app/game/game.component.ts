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

  findEmptyPositions(tiles: Map<number, TileData>) : PositionIndex[] {
    let emptyPos: PositionIndex[] = []

    for (let i = 0; i < DIMENSIONS; i++) {
      for (let j = 0; j < DIMENSIONS; j++) {
        let found = false
        for (let tile of tiles.values()) {
          if (tile.pos.row === i && tile.pos.col === j) {
            found = true
            break
          }
        } 
        if (!found) {
          emptyPos.push({row: i, col: j})
        }
      }
    }
    return emptyPos
  }

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
      // console.log("spawned at: ", pos)
        
      emptyPos.splice(chosenEmpty, 1)
    }
    return id
  }

  /*
  Empty Tiles. Spawn 2 new tiles
  */
  createNewGame() {
    let newTiles = new Map<number, TileData>()
    this.tileId = this.spawnRandomTiles(2, newTiles, this.tileId)
    this.tiles = newTiles
    this.gameFail = false
  }

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

  private checkCombine(combiner: TileData | undefined, combinee: TileData | undefined) : boolean {
    if (combinee !== undefined && combiner !== undefined) {
      // console.log("combinee: ", combinee.value, ", combiner: ", combiner.value)
      if (combinee.combined === true) {
        // console.log("because combined = true")
        return false
      }
      else if (combiner.id !== combinee.id && combiner.value === combinee.value) {
        // console.log('because items are the same value')
        return true
      }
    }
    return false
  }

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

  checkGameFail(posMap: number[][], tiles: Map<number, TileData>) : boolean {
    for (let i = 0; i < posMap.length; i++) {
      for (let j = 0; j < posMap[i].length; j++) {
        if (posMap[i][j] < 0) {
          return false
        }
        if (i + 1 < posMap.length) {
          if (posMap[i + 1][j] < 0) {
            return false
          }
          else if (this.checkCombine(tiles.get(posMap[i][j]), tiles.get(posMap[i + 1][j]))) {
            return false
          }
        }
        if (j + 1 < posMap[i].length) {
          if (posMap[i][j + 1] < 0) {
            return false
          }
          else if (this.checkCombine(tiles.get(posMap[i][j]), tiles.get(posMap[i][j + 1]))) {
            return false
          }
        }
      }
    }
    return true
  }

  moveTilesRecurse(sRow: number, sCol: number, iRow: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>, moveData : TileMovement): PositionIndex {
    // console.log("looking at: ", sRow, sCol)
    if (sCol >= DIMENSIONS || sRow >= DIMENSIONS || sCol < 0 || sRow < 0) {
      if (sCol >= DIMENSIONS || sCol < 0) {
        // console.log("hit horizontal bounds")
        return {row: sRow, col: sCol - iCol}
      }
      else {
        // console.log("hit vertical bounds")
        return {row: sRow - iRow, col: sCol}
      }
    }
    else {
      let outcome = this.moveTilesRecurse(sRow + iRow, sCol + iCol, iRow, iCol, posMatrix, tiles, moveData)
      // console.log("outcome was: ", outcome)
      // console.log('current is: ', {row: sRow, col: sCol})
      if (posMatrix[sRow][sCol] >= 0) { //current is occupied slot
        // console.log("recursed to occupied")
        if (posMatrix[outcome.row][outcome.col] < 0) { //if the outcome was an empty slot. As in the last item was the bound
          let data = tiles.get(posMatrix[sRow][sCol])
          if (data !== undefined) {
            data.pos = outcome
          }
          // console.log("tile moved from " + "{" + sRow + ", " + sCol + "} -> " + "{" + data!.pos.row + ", " + data!.pos.col + "}")
          return { row: sRow, col: sCol }
        }
        else {
          let current = tiles.get(posMatrix[sRow][sCol])
          let search = tiles.get(posMatrix[outcome.row][outcome.col])
          if (current !== undefined && search !== undefined) {
            if (this.checkCombine(current, search)) { //Combinable
              // console.log('combinable')
              // console.log("tile moved from " + "{" + current.pos.row + ", " + current.pos.col + "} -> " + "{" + search.pos.row + ", " + search.pos.col + "}")
              search.combined = true
              search.value *= 2
              current.pos.row = search.pos.row
              current.pos.col = search.pos.col
              current.deleted = true

              moveData.points += search.value
              return outcome
            }
            else if(current.id !== search.id) { //not combinable
              // console.log("not combinable")
              // console.log("tile moved from " + "{" + current.pos.row + ", " + current.pos.col + "} -> " + "{" + (search.pos.row - iRow) + ", " + (search.pos.col - iCol) + "}")
              current.pos.row = search.pos.row - iRow
              current.pos.col = search.pos.col - iCol
              
              return { row: sRow, col: sCol }
            }
          }
        }
      }
      // console.log("propogate")
      return outcome
    }
  }

  moveTilesHorizontal(sCol: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>): TileMovement {
    let original = new Map<number, PositionIndex>()
    for (let tile of tiles.values()) {
      original.set(tile.id, {row: tile.pos.row, col: tile.pos.col })
    }

    let score = {points: 0, changed: false}
    for (let r = 0; r < DIMENSIONS; r++) {
      this.moveTilesRecurse(r, sCol, 0, iCol, posMatrix, tiles, score)
    }

    for (let mem of original.entries()) {
      let tile = tiles.get(mem[0])
      if (tile !== undefined) {
        if (tile.pos.row != mem[1].row || tile.pos.col != mem[1].col) {
          score.changed = true
        }
      }
    }

    return score
  }

  moveTilesVertical(sRow: number, iRow: number, posMatrix: number[][], tiles: Map<number, TileData>): TileMovement {
    let original = new Map<number, PositionIndex>()
    for (let tile of tiles.values()) {
      original.set(tile.id, {row: tile.pos.row, col: tile.pos.col })
    }

    let score = {points: 0, changed: false}
    for (let c = 0; c < DIMENSIONS; c++) {
      this.moveTilesRecurse(sRow, c, iRow, 0, posMatrix, tiles, score)
    }

    for (let mem of original.entries()) {
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


          moveData = this.moveTilesVertical(DIMENSIONS - 1, -1, posMatrix, updatedTiles)
          if (moveData.changed) {
            this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)

            posMatrix = this.mapToMatrix(updatedTiles)
            if (this.checkGameFail(posMatrix, updatedTiles)) {
              this.gameFail = true
              this.gameIsOver.emit()
            }

            this.tiles = updatedTiles
            this.tileMoved.emit({ points: moveData.points })
          }

          event.preventDefault()
          break
        case ('ArrowDown'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)
        
          moveData = this.moveTilesVertical(0, 1, posMatrix, updatedTiles)
          if (moveData.changed) {
            this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)

            posMatrix = this.mapToMatrix(updatedTiles)
            if (this.checkGameFail(posMatrix, updatedTiles)) {
              this.gameFail = true
              this.gameIsOver.emit()
            }

            this.tiles = updatedTiles
            this.tileMoved.emit({ points: moveData.points })
          }
        
          event.preventDefault()
          break
        case ('ArrowLeft'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)

          moveData = this.moveTilesHorizontal(DIMENSIONS - 1, -1, posMatrix, updatedTiles)
          if (moveData.changed) {
            this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)

            posMatrix = this.mapToMatrix(updatedTiles)
            if (this.checkGameFail(posMatrix, updatedTiles)) {
              this.gameFail = true
              this.gameIsOver.emit()
            }

            this.tiles = updatedTiles
            this.tileMoved.emit({ points: moveData.points })
          }

          event.preventDefault()
          break
        case ('ArrowRight'):
          updatedTiles = this.copyAndFilterTiles(this.tiles)
          posMatrix = this.mapToMatrix(updatedTiles)
        
          moveData = this.moveTilesHorizontal(0, 1, posMatrix, updatedTiles)
          if (moveData.changed) {
            this.tileId = this.spawnRandomTiles(SPAWN_AMOUNT, updatedTiles, this.tileId)

            posMatrix = this.mapToMatrix(updatedTiles)
            if (this.checkGameFail(posMatrix, updatedTiles)) {
              this.gameFail = true
              this.gameIsOver.emit()
            }

            this.tiles = updatedTiles
            this.tileMoved.emit({ points: moveData.points })
          }

          event.preventDefault()
          break
      }
    }
  }
}
