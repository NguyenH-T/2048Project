import { Component, EventEmitter, Input, Output, SimpleChanges, inject, numberAttribute } from '@angular/core';
import { PositionIndex, TileMovementService } from '../tile-movement.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tile',
  standalone: true,
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

  getColor(value: number) : string {
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
        return ''
      case (128):
        return ''
      case (256):
        return ''
      case (516):
        return ''
      case (1024):
        return ''
      case (2048):
        return ''
    }
    return ''
  }

  getAnimation() {
    let stringPos = this.tileMovementService.getPosition(this.pos)
    return {
      backgroundColor: this.getColor(this.value),
      transform: 'translate(' + stringPos.left + ", " + stringPos.top + ')',
      zIndex: this.deleted ? '0' : '1',
    }
  }
}
