import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-16',
  templateUrl: './hero-16.component.html',
  styleUrls: ['./hero-16.component.css']
})
export class Hero16Component {
  @Input() heroId: number = 16;
  name: string = 'Hero 16';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}