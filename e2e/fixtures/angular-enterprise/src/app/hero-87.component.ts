import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-87',
  templateUrl: './hero-87.component.html',
  styleUrls: ['./hero-87.component.css']
})
export class Hero87Component {
  @Input() heroId: number = 87;
  name: string = 'Hero 87';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}