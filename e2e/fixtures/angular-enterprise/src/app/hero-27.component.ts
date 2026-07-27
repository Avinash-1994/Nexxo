import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-27',
  templateUrl: './hero-27.component.html',
  styleUrls: ['./hero-27.component.css']
})
export class Hero27Component {
  @Input() heroId: number = 27;
  name: string = 'Hero 27';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}