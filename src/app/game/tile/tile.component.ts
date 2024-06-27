import { Component, EventEmitter, Input, Output, numberAttribute } from '@angular/core';
import { AnimationData } from '../game.component';

const speed : number = 30

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css',
})
export class TileComponent {
  @Input({ required: true }) id : number = -1
  @Input({ required: true, transform: numberAttribute }) value = 0
  @Input({ required: true }) animation: AnimationData | undefined = new AnimationData()
  @Output() childAnimationDone = new EventEmitter()
  top : string = '0'
  left : string = '0'
  time = 50

  ngOnChanges() {
    if (this.animation !== undefined) {
      this.top = this.animation.top
      this.left = this.animation.left
      this.time = this.animation.distance / speed 
    }
  }

  getAnimation() {
    let cssAnimation = 'transform: translate(' + this.left + ', ' + this.top + ');'
    cssAnimation += 'transition-duration: ' + this.time + 's;'
    return cssAnimation
  }

  transitionEndHandler() {
    this.childAnimationDone.emit({id: this.id})
  }
}
