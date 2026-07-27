import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-36',
  templateUrl: './hero-36.component.html',
  styleUrls: ['./hero-36.component.css']
})
export class Hero36Component {
  @Input() heroId: number = 36;
  name: string = 'Hero 36';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}