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

  getColor(value: number): string {
    switch (value) {
      case (2):
        return 'purple'
      case (4):
        return 'blue'
      case (8):
        return 'cyan'
      case (16):
        return 'orange'
      case (32):
        return 'red'
      case (64):
        return 'grey'
      case (128):
        return 'grey'
      case (256):
        return 'grey'
      case (516):
        return 'grey'
      case (1024):
        return 'grey'
      case (2048):
        return 'grey'
    }
    return 'grey'
  }

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
