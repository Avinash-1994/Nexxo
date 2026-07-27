import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-160',
  templateUrl: './hero-160.component.html',
  styleUrls: ['./hero-160.component.css']
})
export class Hero160Component {
  @Input() heroId: number = 160;
  name: string = 'Hero 160';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}