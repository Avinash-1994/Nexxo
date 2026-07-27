import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-76',
  templateUrl: './hero-76.component.html',
  styleUrls: ['./hero-76.component.css']
})
export class Hero76Component {
  @Input() heroId: number = 76;
  name: string = 'Hero 76';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}