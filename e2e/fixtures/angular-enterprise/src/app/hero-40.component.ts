import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-40',
  templateUrl: './hero-40.component.html',
  styleUrls: ['./hero-40.component.css']
})
export class Hero40Component {
  @Input() heroId: number = 40;
  name: string = 'Hero 40';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}