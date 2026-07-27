import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-109',
  templateUrl: './hero-109.component.html',
  styleUrls: ['./hero-109.component.css']
})
export class Hero109Component {
  @Input() heroId: number = 109;
  name: string = 'Hero 109';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}