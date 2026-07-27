import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-111',
  templateUrl: './hero-111.component.html',
  styleUrls: ['./hero-111.component.css']
})
export class Hero111Component {
  @Input() heroId: number = 111;
  name: string = 'Hero 111';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}