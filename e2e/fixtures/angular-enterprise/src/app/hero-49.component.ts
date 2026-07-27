import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-49',
  templateUrl: './hero-49.component.html',
  styleUrls: ['./hero-49.component.css']
})
export class Hero49Component {
  @Input() heroId: number = 49;
  name: string = 'Hero 49';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}