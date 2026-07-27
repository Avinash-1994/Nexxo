import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-28',
  templateUrl: './hero-28.component.html',
  styleUrls: ['./hero-28.component.css']
})
export class Hero28Component {
  @Input() heroId: number = 28;
  name: string = 'Hero 28';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}