import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-165',
  templateUrl: './hero-165.component.html',
  styleUrls: ['./hero-165.component.css']
})
export class Hero165Component {
  @Input() heroId: number = 165;
  name: string = 'Hero 165';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}