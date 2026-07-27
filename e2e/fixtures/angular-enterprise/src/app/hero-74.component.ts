import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-74',
  templateUrl: './hero-74.component.html',
  styleUrls: ['./hero-74.component.css']
})
export class Hero74Component {
  @Input() heroId: number = 74;
  name: string = 'Hero 74';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}