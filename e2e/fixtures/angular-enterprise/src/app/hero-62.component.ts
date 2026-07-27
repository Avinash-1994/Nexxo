import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-62',
  templateUrl: './hero-62.component.html',
  styleUrls: ['./hero-62.component.css']
})
export class Hero62Component {
  @Input() heroId: number = 62;
  name: string = 'Hero 62';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}