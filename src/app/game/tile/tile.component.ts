import { Component, EventEmitter, Input, Output, SimpleChanges, inject, numberAttribute } from '@angular/core';
import { PositionIndex, TileMovementService } from '../tile-movement.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tile',
  standalone: true,
  animations: [
    trigger('spawnInOut', [
      transition(':enter', [style({ scale: 0.5, opacity: 0 }), animate('200ms', style({ scale: 1, opacity: 1}))]),
      transition(':leave', [animate('1s', style({scale: 0.5, opacity: 0}))])
    ]),
    trigger('valueColor', [
      state('2', style({ backgroundColor: 'purple' })),
      state('4', style({ backgroundColor: 'blue' })),
      state('8', style({ backgroundColor: 'cyan' })),
      state('16', style({ backgroundColor: 'orange' })),
      state('32', style({ backgroundColor: 'red' })),
      state('64', style({ backgroundColor: '' })),
      state('128', style({ backgroundColor: '' })),
      state('256', style({ backgroundColor: '' })),
      state('516', style({ backgroundColor: '' })),
      state('1024', style({ backgroundColor: '' })),
      state('2048', style({ backgroundColor: '' })),
      transition('* => *', animate('100ms ease')),
    ])
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
  private tileMovementService = inject(TileMovementService)

  getAnimation() {
    let stringPos = this.tileMovementService.getPosition(this.pos)
    return {
      transform: 'translate(' + stringPos.left + ", " + stringPos.top + ')',
      zIndex: this.deleted ? '0' : '1',
    }
  }
}
