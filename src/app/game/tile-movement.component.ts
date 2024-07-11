import { Injectable } from "@angular/core";

export interface PositionString {
    top: string,
    left: string
}

export interface PositionIndex {
    row: number,
    col: number
}

@Injectable({
    providedIn: 'root',
})
export class TileMovementService {
    possiblePositions : PositionString[][] = [
        [{ top: '0', left: '0' }, { top: '0', left: '118%' }, { top: '0', left: '236%' }, { top: '0', left: '354.5%' }],
        [{ top: '118%', left: '0' }, { top: '118%', left: '118%' }, { top: '118%', left: '236%' }, { top: '118%', left: '354.5%' }],
        [{ top: '236%', left: '0' }, { top: '236%', left: '118%' }, { top: '236%', left: '236%' }, { top: '236%', left: '354.5%' }],
        [{ top: '354.5%', left: '0' }, { top: '354.5%', left: '118%' }, { top: '354.5%', left: '236%' }, { top: '354.5%', left: '354.5%' }]
    ]

    getPosition(index: PositionIndex) : PositionString {
        return this.possiblePositions[index.row][index.col]
    }

    calcCardinalDistance(dimension: number, start: number, end: number) : number{
        let diff = start - end
        if (diff === 0) {
          return diff
        }
        else if (diff % dimension === 0) {
          return Math.abs(diff / dimension)
        }
        else if (diff < dimension) {
          return Math.abs(diff)
        }
        else {
          return -1
        }
      }
}