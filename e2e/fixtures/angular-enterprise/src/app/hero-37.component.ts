import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-37',
  templateUrl: './hero-37.component.html',
  styleUrls: ['./hero-37.component.css']
})
export class Hero37Component {
  @Input() heroId: number = 37;
  name: string = 'Hero 37';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}