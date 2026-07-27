import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-1',
  templateUrl: './hero-1.component.html',
  styleUrls: ['./hero-1.component.css']
})
export class Hero1Component {
  @Input() heroId: number = 1;
  name: string = 'Hero 1';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}