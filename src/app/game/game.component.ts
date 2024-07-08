import { Component, EventEmitter, Injectable, Output } from '@angular/core';
import { TileComponent } from './tile/tile.component';
import { PositionIndex } from './tile-movement.component';

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
  //Unique id for each TileData
  tileId = 0
  tiles: Map<number, TileData>

  constructor() {
    let newTiles = new Map<number, TileData>()
    this.spawnRandomTiles(2, newTiles)
    this.tiles = newTiles
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
      // console.log("spawned at: ", pos)
        
      emptyPos.splice(chosenEmpty, 1)
    }
  }

  /*
  Empty Tiles. Spawn 2 new tiles
  */
  // createNewGame() {
  //   this.tileId = 0
  //   let newTiles = new Map<number, TileData>()
  //   this.spawnRandomTiles(2, newTiles)
  //   this.tiles = newTiles
  // }

  printTiles(tiles: Map<number, TileData>): string {
    let output = ""
    for (let tile of tiles.values()) {
      output += "id: " + tile.id + "\n"
      output += "value: " + tile.value + "\n"
      output += "pos: [" + tile.pos.row + ", " + tile.pos.col + "] \n"
      output += "combined: " + tile.combined + "\n"
      output += "deleted: " + tile.deleted + "\n"
      output += "distance: " + tile.distance + "\n"
      output += "-----------------------------------------------------------\n"
    }
    return output
  }

  copyAndFilterTiles() {
    let copy = new Map<number, TileData>()
    for (let tile of this.tiles.values()) {
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
    let matrix: number[][] = new Array(dimensions)
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(dimensions).fill(-1)
    }
    
    for (let tile of tiles.values()) {
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
        
          for (let space of toCheck) {
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

  moveTilesRecurse(sRow: number, sCol: number, iRow: number, iCol: number, posMatrix: number[][], tiles: Map<number, TileData>): PositionIndex {
    console.log("looking at: ", sRow, sCol)
    if (sCol >= dimensions || sRow >= dimensions || sCol < 0 || sRow < 0) {
      if (sCol >= dimensions || sCol < 0) {
        // console.log("hit horizontal bounds")
        return {row: sRow, col: sCol - iCol}
      }
      else {
        // console.log("hit vertical bounds")
        return {row: sRow - iRow, col: sCol}
      }
    }
    else {
      let outcome = this.moveTilesRecurse(sRow + iRow, sCol + iCol, iRow, iCol, posMatrix, tiles)
      // console.log(outcome)
      if (posMatrix[sRow][sCol] >= 0) { //current is occupied slot
        // console.log("recursed to occupied")
        if (posMatrix[outcome.row][outcome.col] < 0) { //if the outcome was the bound
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
              return outcome
            }
            else if(current.id !== search.id) { //not combinable
              // console.log("not combinable")
              // console.log("tile moved from " + "{" + current.pos.row + ", " + current.pos.col + "} -> " + "{" + search.pos.row + ", " + search.pos.col + "}")
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
          this.spawnRandomTiles(2, updatedTiles)
          this.tiles = updatedTiles
        }

        event.preventDefault()
        break
      case ('ArrowDown'):
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)
        
        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesVertical(0, 1, posMatrix, updatedTiles)
          this.spawnRandomTiles(2, updatedTiles)
          this.tiles = updatedTiles
        }
        
        event.preventDefault()
        break
      case ('ArrowLeft'): 
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)

        console.log(posMatrix.toString())

        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesHorizontal(dimensions - 1, -1, posMatrix, updatedTiles)
          this.spawnRandomTiles(2, updatedTiles)
          this.tiles = updatedTiles
        }

        event.preventDefault()
        break
      case ('ArrowRight'):
        updatedTiles = this.copyAndFilterTiles()
        posMatrix = this.mapToMatrix(updatedTiles)
        
        if (this.checkValidMove(updatedTiles, posMatrix)) {
          this.moveTilesHorizontal(0, 1, posMatrix, updatedTiles)
          this.spawnRandomTiles(2, updatedTiles)
          this.tiles = updatedTiles
        }

        event.preventDefault()
        break
    }
  }
}
