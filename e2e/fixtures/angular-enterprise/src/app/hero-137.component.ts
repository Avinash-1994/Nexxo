import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-137',
  templateUrl: './hero-137.component.html',
  styleUrls: ['./hero-137.component.css']
})
export class Hero137Component {
  @Input() heroId: number = 137;
  name: string = 'Hero 137';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}