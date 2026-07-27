import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-45',
  templateUrl: './hero-45.component.html',
  styleUrls: ['./hero-45.component.css']
})
export class Hero45Component {
  @Input() heroId: number = 45;
  name: string = 'Hero 45';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}