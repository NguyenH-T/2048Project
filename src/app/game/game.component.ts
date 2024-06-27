import { Component, ContentChildren, Injectable, QueryList, ViewChildren } from '@angular/core';
import { TileComponent } from './tile/tile.component';
import { PositionIndex } from './tile-movement.component';

/*
This class represents the data for each tile. So TileComponents is only the display and 
this component controls everything else
*/
class TileData {
  id: number
  value: number
  pos: PositionIndex
  distance: number = 0
  combined = false
  deleted = false
  
  constructor(_id: number, _value: number, _pos: PositionIndex) {
    this.id = _id
    this.value = _value
    this.pos = _pos
  }
}
//The chance for a tile to have a value of 4 instead of 2
const chanceFor4Value = 0.25
//0 based
const dimensions : number = 4

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-game',
  standalone: true,
  host: {
    '(document:keydown)': 'keyDownHandler($event)',
    '(childAnimationDone)': 'animationCallback($event)'
  },
  imports: [ TileComponent ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  //Const of all positions in the grid
  possiblePositions = [
    { top: '0', left: '0' }, { top: '0', left: '118%' }, { top: '0', left: '236%' }, { top: '0', left: '354.5%' },
    { top: '118%', left: '0' }, { top: '118%', left: '118%' }, { top: '118%', left: '236%' }, { top: '118%', left: '354.5%' },
    { top: '236%', left: '0' }, { top: '236 %', left: '118%' }, { top: '236%', left: '236%' }, { top: '236%', left: '354.5%' },
    { top: '354.5%', left: '0' }, { top: '354.5%', left: '118%' }, { top: '354.5%', left: '236%' }, { top: '354.5%', left: '354.5%' }
  ]
  //Unique id for each TileData
  tileId = 0
  tiles: Map<number, TileData> = new Map

  constructor() {
    this.createNewGame()
  }

  private findFilledPositions(tiles: Map<number, TileData>): Set<PositionIndex> {
    let filledPositions = new Set<PositionIndex>()
    for (let tile of tiles.values()) {
      filledPositions.add(tile.pos)
    }
    return filledPositions
  }

  private findEmptyPositions(tiles: Map<number, TileData>) : PositionIndex[] {
    let filled = this.findFilledPositions(tiles)
    let emptyPos: PositionIndex[] = []

    for (let i = 0; i < dimensions; i++) {
      for (let j = 0; j < dimensions; j++) {
        if (!filled.has({ row: i, col: j })) {
          emptyPos.push({ row: i, col: j })
        }
      }
    }
    return emptyPos
  }

  private spawnRandomTiles(amount: number, tiles: Map<number, TileData>) {
    //create a list of all empty positions
    let emptyPos = this.findEmptyPositions(tiles)

    //spawn a set amount of tiles
    for (let i = 0; i < amount; i++) {
      let chosenEmpty = Math.floor(Math.random() * emptyPos.length)
      let value = Math.random() < chanceFor4Value ? 4 : 2;
      let pos = emptyPos[chosenEmpty]
      let id = this.tileId++
      tiles.set(id, new TileData(id, value, pos))
        
      emptyPos.splice(chosenEmpty, 1)
    }
  }

  /*
  Empty Tiles. Spawn 2 new tiles
  */
  createNewGame() {
    this.tileId = 0
    this.tiles = new Map<number, TileData>()
    this.spawnRandomTiles(2, this.tiles)
  }

  copyAndFilterTiles() {
    let copy = new Map<number, TileData>()
    for (const tile of this.tiles.values()) {
      if (!tile.deleted) {
        copy.set(tile.id, tile)
      }
    }
    return copy
  }

  private checkCombine(combiner: TileData | undefined, combinee: TileData | undefined) : boolean {
    if (combinee !== undefined && combiner !== undefined) {
      if (combinee.combined = true) {
        return false
      }
      else if (combiner.value === combinee.value) {
        return true
      }
    }
    return false
  }

  mapToMatrix(tiles: Map<number, TileData>): number[][] {
    let matrix : number[][] = new Array(dimensions).fill(new Array(dimensions).fill(-1))
    for (const tile of tiles.values()) {
      matrix[tile.pos.row][tile.pos.col] = tile.id
    }
    return matrix
  }

  private getOccupiedSpace(posMap: number[][], row: number, col: number): number[] {
    let spaces = []
    if (row - 1 >= 0) {
      spaces.push(posMap[row - 1][col])
    }
    if (row + 1 < dimensions) {
      spaces.push(posMap[row + 1][col])
    }
    if (col - 1 >= 0) {
      spaces.push(posMap[row][col - 1])
    }
    if (col + 1 < dimensions) {
      spaces.push(posMap[row][col + 1])
    }
    return spaces
  }

  checkValidMove(tiles: Map<number, TileData>, posMap: number[][]) : boolean {
    for (let i = 0; i < dimensions; i++) {
      for (let j = 0; j < dimensions; j++) {
        if (posMap[i][j] >= 0) {
          let toCheck = this.getOccupiedSpace(posMap, i, j)
        
          for (const space of toCheck) {
            if (space >= 0) { //occupied space
              if (this.checkCombine(tiles.get(posMap[i][j]), tiles.get(space))) { //check if can combine
                return true
              }
            }
            else { //unoccupied space
              return true
            }
          }
        }
      }
    }
    return false
  }

  private moveTilesRecurse(sRow: number, sCol: number, iRow: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>) : PositionIndex {
    if (sCol >= dimensions || sRow >= dimensions || sCol < 0 || sRow < 0) {
      if (sCol >= dimensions || sCol < 0) {
        return {row: sRow, col: sCol - iCol}
      }
      else {
        return {row: sRow - iRow, col: sCol}
      }
    }
    else {
      let outcome = this.moveTilesRecurse(sRow + iRow, sCol + iCol, iRow, iCol, posMatrix, tiles)
      if (posMatrix[sRow][sCol] >= 0) { //is occupied slot
        if (posMatrix[outcome.row][outcome.col] < 0) { //if the outcome was the bound
          let data = tiles.get(posMatrix[sRow][sCol])
          if (data !== undefined) {
            data.pos= outcome
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
              current.pos = search.pos
              current.deleted = true
              return outcome
            }
            else { //not combinable
              current.pos = search.pos
              current.pos.col - iCol
              current.pos.row - iRow
              return { row: sRow, col: sCol }
            }
          }
        }
      }
      return outcome
    }
  }

  moveTilesHorizontal(sCol: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>) {
    for (let r = 0; r < dimensions; r++) {
      this.moveTilesRecurse(r, sCol, 0, iCol, posMatrix, tiles)
    }
  }

  moveTilesVertical(sRow: number, iRow: number, posMatrix: number[][], tiles: Map<number, TileData>) {
    for (let c = 0; c < dimensions; c++) {
      this.moveTilesRecurse(sRow, c, iRow, 0, posMatrix, tiles)
    }
  }

  keyDownHandler(event: KeyboardEvent) {
    let updatedTiles: Map<number, TileData>
    let posMatrix: number[][]
    switch (event.key) {
      case ('ArrowUp'):
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)

        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesVertical(dimensions - 1, -1, posMatrix, updatedTiles)
        }

        event.preventDefault()
        break
      case ('ArrowDown'):
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)
        
        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesVertical(0, 1, posMatrix, updatedTiles)
        }
        
        event.preventDefault()
        break
      case ('ArrowLeft'): 
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)

        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesHorizontal(0, 1, posMatrix, updatedTiles)
        }

        event.preventDefault()
        break
      case ('ArrowRight'):
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)
        
        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesHorizontal(dimensions - 1, -1, posMatrix, updatedTiles)
        }

        event.preventDefault()
        break
    }
  }
}
