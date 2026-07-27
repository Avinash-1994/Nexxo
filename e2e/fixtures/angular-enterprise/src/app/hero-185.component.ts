import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-185',
  templateUrl: './hero-185.component.html',
  styleUrls: ['./hero-185.component.css']
})
export class Hero185Component {
  @Input() heroId: number = 185;
  name: string = 'Hero 185';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}