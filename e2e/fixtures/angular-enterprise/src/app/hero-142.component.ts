import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-142',
  templateUrl: './hero-142.component.html',
  styleUrls: ['./hero-142.component.css']
})
export class Hero142Component {
  @Input() heroId: number = 142;
  name: string = 'Hero 142';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}