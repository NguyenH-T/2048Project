import { Component, EventEmitter, Input, Output, SimpleChanges, inject, numberAttribute } from '@angular/core';
import { PositionIndex, TileMovementService } from '../tile-movement.component';

const speed : number = 30

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
  private tileMovementService = inject(TileMovementService)

  getAnimation() {
    let stringPos = this.tileMovementService.getPosition(this.pos)
    return {
      transform: 'translate(' + stringPos.left + ", " + stringPos.top + ')',
      zIndex: this.deleted ? '0' : '1',
    }
  }
}
