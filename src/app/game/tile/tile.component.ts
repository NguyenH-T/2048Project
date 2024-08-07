import { Component, EventEmitter, Input, Output, SimpleChanges, inject, numberAttribute } from '@angular/core';
import { PositionIndex, TileMovementService } from '../tile-movement.component';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tile',
  standalone: true,
  animations: [
    trigger('position', [
      state('move', 
        style({
          transform: 'translate( {{left}}, {{top}} )',
          zIndex: '{{deleted}}',
          backgroundColor: '{{color}}'
        }), {
          params: {
            left: 0,
            top: 0,
            deleted: 0,
            color: 'grey'
        }}
      ),
      transition('move => move', [animate('{{time}}')])
    ]),
    trigger('spawn', [
      transition(':enter', [
        style({
          transform: 'translate( {{left}}, {{top}} ) scale( {{startSize}} )',
          zIndex: '{{deleted}}',
          opacity: '{{opacity}}',
          backgroundColor: '{{color}}'
        }),
        animate('{{time}}',
          style({
            transform: 'translate( {{left}}, {{top}} ) scale(1)',
            zIndex: '{{deleted}}',
            opacity: 1,
            backgroundColor: '{{color}}'
        }))
      ])
    ]),
    trigger('combine', [
      transition('* => grow', [
        animate('{{time}}', 
          keyframes([
            style({
              transform: 'translate( {{left}}, {{top}} ) scale( {{startSize}} )',
              zIndex: '{{deleted}}',
              backgroundColor: '{{startColor}}'
            }),
            style({
              transform: 'translate( {{left}}, {{top}} ) scale( {{growthSize}} )',
              zIndex: '{{deleted}}',
              backgroundColor: '{{endColor}}'
            }),
            style({
              transform: 'translate( {{left}}, {{top}} ) scale( {{startSize}} )',
              zIndex: '{{deleted}}',
              backgroundColor: '{{endColor}}'
            })
          ])
        )
      ])
    ]),

  ],
  imports: [],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css',
})
export class TileComponent {
  @Input({ required: true }) id: number = -1
  @Input({ required: true, transform: numberAttribute }) value : number = 0
  @Input({ required: true }) pos : PositionIndex = { row: 0, col: 0 }
  @Input({ required: true }) travelDist: number = 0
  @Input({ required: true }) combined: boolean = false
  @Input({ required: true }) deleted: boolean = false
  @Input({ required: true }) spawn: boolean = false
  private tileMovementService = inject(TileMovementService)

  /*
  gets the determined for the tile value
  */
  getColor(value: number): string {
    switch (value) {
      case (2):
        return '#B8B8B8'
      case (4):
        return '#A6B1B9'
      case (8):
        return '#93ABBA'
      case (16):
        return '#81A4BC'
      case (32):
        return '#6E9EBD'
      case (64):
        return '#5C97BE'
      case (128):
        return '#4A90BF'
      case (256):
        return '#378AC0'
      case (516):
        return '#2583C2'
      case (1024):
        return '#127DC3'
      case (2048):
        return '#0076C4'
    }
    return 'grey'
  }

  /*
  returns the values for the position that the tile should be placed at when using animations
  */
  getPosition() {
    let stringPos = this.tileMovementService.getPosition(this.pos)
    return {
      value: 'move',
      params: {
        left: stringPos.left,
        top: stringPos.top,
        time: '200ms',
        deleted: this.deleted ? 0 : 1,
        color: this.getColor(this.value)
      }
    }
  }

  /*
  returns the values for the position that the tile is placed at and plays the spawn animation
  */
  getSpawn() {
    let stringPos = this.tileMovementService.getPosition(this.pos)
    return {
      value: ':enter',
      params: {
        left: stringPos.left,
        top: stringPos.top,
        deleted: this.deleted ? 0 : 1,
        time: '100ms',
        startSize: 0.2,
        opacity: 0.4,
        color: this.getColor(this.value)
      }
    }
  }

  /*
  plays the combine animation
  */
  getCombine() {
    let stringPos = this.tileMovementService.getPosition(this.pos)
    if (this.combined) {
      return {
        value: 'grow',
        params: {
          left: stringPos.left,
          top: stringPos.top,
          deleted: this.deleted ? 0 : 1,
          time: '240ms',
          startSize: 1,
          growthSize: 1.1,
          startColor: this.getColor(this.value / 2),
          endColor: this.getColor(this.value)
        }
      }
    }
    return {
      value: 'none'
    }
  }

}
