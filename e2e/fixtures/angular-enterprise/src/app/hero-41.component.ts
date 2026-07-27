import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-41',
  templateUrl: './hero-41.component.html',
  styleUrls: ['./hero-41.component.css']
})
export class Hero41Component {
  @Input() heroId: number = 41;
  name: string = 'Hero 41';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}