import { Component, Input, ViewEncapsulation, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css',
})
export class TileComponent {
  @Input({ required: true, transform: numberAttribute }) value = 0
  @Input({ required: true }) currentPosition = 'top: \'0\', left: \'0\''
  
}
