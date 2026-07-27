import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-61',
  templateUrl: './hero-61.component.html',
  styleUrls: ['./hero-61.component.css']
})
export class Hero61Component {
  @Input() heroId: number = 61;
  name: string = 'Hero 61';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}