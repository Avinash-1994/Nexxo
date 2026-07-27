import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-68',
  templateUrl: './hero-68.component.html',
  styleUrls: ['./hero-68.component.css']
})
export class Hero68Component {
  @Input() heroId: number = 68;
  name: string = 'Hero 68';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}