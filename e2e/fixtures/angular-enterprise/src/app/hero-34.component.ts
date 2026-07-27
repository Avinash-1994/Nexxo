import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-34',
  templateUrl: './hero-34.component.html',
  styleUrls: ['./hero-34.component.css']
})
export class Hero34Component {
  @Input() heroId: number = 34;
  name: string = 'Hero 34';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}