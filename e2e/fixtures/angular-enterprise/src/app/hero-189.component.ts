import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-189',
  templateUrl: './hero-189.component.html',
  styleUrls: ['./hero-189.component.css']
})
export class Hero189Component {
  @Input() heroId: number = 189;
  name: string = 'Hero 189';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}