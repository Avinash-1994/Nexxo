import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-35',
  templateUrl: './hero-35.component.html',
  styleUrls: ['./hero-35.component.css']
})
export class Hero35Component {
  @Input() heroId: number = 35;
  name: string = 'Hero 35';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}