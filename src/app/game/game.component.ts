import { Component, ContentChildren, Injectable, QueryList, ViewChildren } from '@angular/core';
import { TileComponent } from './tile/tile.component';

export class AnimationData {
  top: string
  left: string
  combined: boolean
  deleted: boolean
  distance: number

  constructor(_top: string = '0', _left: string = '0', _distance: number = 0, _combined: boolean = false, _deleted: boolean = false) {
    this.top = _top
    this.left = _left
    this.distance = _distance
    this.combined = _combined
    this.deleted = _deleted
  }
}
/*
This class represents the data for each tile. So TileComponents is only the display and 
this component controls everything else
*/
class TileData {
  id: number;
  value: number;
  combined = false
  deleted = false
  
  constructor(_id: number, _value: number) {
    this.id = _id
    this.value = _value
  }
}
//The chance for a tile to have a value of 4 instead of 2
const chanceFor4Value = 0.25
//0 based
const dimensions = 4

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
  tiles: TileData[] = []
  playAnimation: Map<number, AnimationData> = new Map()
  nextFrame: TileData[] = []

  constructor() {
    this.createNewGame()
  }

  private spawnRandomTiles(amount: number, endpoint: TileData[], animations: Map<number, AnimationData>) {
    //create a list of all empty positions
    let emptyPositions = []
    for (let i = 0; i < 16; i++) {
      if (endpoint[i].value === 0) {
        emptyPositions.push(i)
      }
    }

    //spawn a set amount of tiles
    for (let i = 0; i < amount; i++) {
      let chosenEmpty = Math.floor(Math.random() * emptyPositions.length)
      let value = Math.random() < chanceFor4Value ? 4 : 2;
      let chosenIndex = emptyPositions[chosenEmpty]
      endpoint[chosenIndex] = new TileData(this.tileId++, value)

      let data = new AnimationData(this.possiblePositions[chosenIndex].top, this.possiblePositions[chosenIndex].left,)
      animations.set(endpoint[chosenIndex].id, data)

      emptyPositions.splice(chosenEmpty, 1)
    }
  }

  copyTiles(): TileData[] {
    let copy: TileData[] = []
    for (let i = 0; i < this.tiles.length; i++) {
      if (!this.tiles[i].deleted) {
        copy.push(this.tiles[i])
      }
    }
    return copy
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
    let animations =  new Map<number, AnimationData>()
    this.spawnRandomTiles(2, this.tiles, animations)
    this.playAnimation = animations
  }

  private calcCardinalDistance(start: number, end: number) : number{
    let diff = start - end
    if (diff === 0) {
      return diff
    }
    else if (diff % dimensions === 0) {
      return Math.abs(diff / dimensions)
    }
    else if (diff < dimensions) {
      return Math.abs(diff)
    }
    else {
      return -1
    }
  }

  moveTilesHorizontal(start: number, increment: number, endpoint: TileData[], animations: Map<number, AnimationData>) : boolean {
    //loop through columns
    let changed = false
    for (let r = 0; r < dimensions; r++) {
      //loop through row. Since this is a single dimension array mimicing a 2d array the formula is 4 * row + columned
      for (let c = dimensions * r + start; c < dimensions * r + dimensions && c >= dimensions * r; c += increment) {
        //finding the tiles from left -> right
        if (endpoint[c].value > 0) {
          //finding the tiles from right -> left
          for (let i = c - increment; i < dimensions * r + dimensions && i >= dimensions * r; i -= increment) { 
            if ((i == dimensions * r || i == dimensions * r + dimensions - 1) && endpoint[i].value === 0) { //checking if we hit the bounding box
              let temp = endpoint[i]
              endpoint[i] = endpoint[c]
              endpoint[c] = temp
              changed = true

              let data = new AnimationData(this.possiblePositions[i].top, this.possiblePositions[i].left, this.calcCardinalDistance(c, i))
              animations.set(endpoint[i].id, data)
            }
            else if (endpoint[i].value > 0) { //checking for occupied tile
              //combine the tiles
              if (endpoint[i].value === endpoint[c].value && !endpoint[i].combined) {
                endpoint[i].value += endpoint[c].value
                endpoint[i].combined = true

                endpoint[c].deleted = true
                endpoint.push(endpoint[c]) //move the to be deleted tile to the end of the array
                endpoint[c] = new TileData(this.tileId++, 0) //replace with an empty tile
                changed = true

                let data: AnimationData | undefined = animations.get(endpoint[i].id)
                if (data === undefined) {
                  data = new AnimationData(this.possiblePositions[i].top, this.possiblePositions[i].left, this.calcCardinalDistance(i, c))
                }
                data.combined = true
                animations.set(endpoint[i].id, data)

                data = new AnimationData(this.possiblePositions[i].top, this.possiblePositions[i].left, this.calcCardinalDistance(i, c), false, true)
                animations.set(endpoint[-1].id, data)
                //------------ TODO: add to animation map
              }
              else {
                //can't combine. Then move to the next slot to the right
                //Empty slots is mock TileData so we can swap them
                let temp = endpoint[i + increment]
                endpoint[i + increment] = endpoint[c]
                endpoint[c] = temp 
                changed = true

                let data = new AnimationData(this.possiblePositions[i + increment].top, this.possiblePositions[i + increment].left, this.calcCardinalDistance(i + increment, c))
                animations.set(endpoint[i + increment].id, data)
                //---------- TODO: add to animation map
              }
              //After either option is chosen. Stop moving the current tile.
              break
            }
          }
        }
      }
    }
    return changed
  }

  moveTilesVertical(direction: number, endpoint: TileData[], animations: Map<number, AnimationData>) : boolean {
    //searching top -> bottom
    let changed = false
    for (let c = 0; c < dimensions; c++) {
      for (let r = (direction > 0) ? 0 : 2; r < dimensions && r >= 0; r += direction) {
        //looking for occupied tile
        let search = dimensions * r + c
        if (endpoint[search].value > 0) {
          //searching bottom -> top
          for (let i = search - (dimensions * direction); i >= c && i <= dimensions * 3 + c; i -= (dimensions * direction)) {
            //found bound
            if ((i === c || i === 3 * dimensions + c) && endpoint[i].value === 0) {
              let temp = endpoint[i]
              endpoint[i] = endpoint[search]
              endpoint[search] = temp
              changed = true

              let data = new AnimationData(this.possiblePositions[i].top, this.possiblePositions[i].left, this.calcCardinalDistance(i, search))
              animations.set(endpoint[i].id, data)
            }
            else if (endpoint[i].value > 0) { //found occupied tile
              if (endpoint[i].value === endpoint[search].value && !endpoint[i].combined) {
                endpoint[i].value += endpoint[search].value
                endpoint[i].combined = true

                endpoint[search].deleted = true
                endpoint.push(endpoint[search]) //move the to be deleted tile to the end of the array
                endpoint[search] = new TileData(this.tileId++, 0) //replace with empty tile
                changed = true

                let data: AnimationData | undefined = animations.get(endpoint[i].id)
                if (data === undefined) {
                  data = new AnimationData(this.possiblePositions[i].top, this.possiblePositions[i].left, this.calcCardinalDistance(i, search))
                }
                data.combined = true
                animations.set(endpoint[i].id, data)
                
                data = new AnimationData(this.possiblePositions[search].top, this.possiblePositions[search].left, this.calcCardinalDistance(i, search), false, true)
                animations.set(endpoint[-1].id, data)
                //----------------- TODO: Add to animation map
              }
              else if (endpoint[i + (dimensions * direction)].id !== endpoint[search].id) {
                let temp = endpoint[i + (dimensions * direction)]
                let firstEmpty = i + (dimensions * direction)
                endpoint[firstEmpty] = endpoint[search]
                endpoint[search] = temp
                changed = true

                let data = new AnimationData(this.possiblePositions[firstEmpty].top, this.possiblePositions[firstEmpty].left, this.calcCardinalDistance(firstEmpty, search))
                animations.set(endpoint[firstEmpty].id, data)
                //--------------------- TODO: Add to animation map
              }
              break
            }
          }
        }
      }
    }
    return changed
  }

  animationCallback(event: Event) {
    console.log(event)
  }

  keyDownHandler(event: KeyboardEvent) {
    let endpoint
    let animations
    switch (event.key) {
      case ('ArrowUp'):
        endpoint = this.copyTiles()
        animations = new Map<number, AnimationData>()
        if (this.moveTilesVertical(1, endpoint, animations)) {
          //this.spawnRandomTiles(2, endpoint, animations)
          this.playAnimation = animations
        }
        event.preventDefault()
        break
      case ('ArrowDown'):
        endpoint = this.copyTiles()
        animations = new Map<number, AnimationData>()
        if (this.moveTilesVertical(-1, endpoint, animations)) {
          //this.spawnRandomTiles(2, endpoint, animations)
          this.playAnimation = animations
        }
        event.preventDefault()
        break
      case ('ArrowLeft'): 
        endpoint = this.copyTiles()
        animations = new Map<number, AnimationData>()
        if (this.moveTilesHorizontal(1, 1, endpoint, animations)) {
          //this.spawnRandomTiles(2, endpoint, animations)
          this.playAnimation = animations
        }
        event.preventDefault()
        break
      case ('ArrowRight'):
        endpoint = this.copyTiles()
        animations = new Map<number, AnimationData>()
        if (this.moveTilesHorizontal(2, -1, endpoint, animations)) {
          //this.spawnRandomTiles(2, endpoint, animations)
          this.playAnimation = animations
        }
        event.preventDefault()
        break
    }
  }
}
