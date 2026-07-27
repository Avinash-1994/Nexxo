import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-4',
  templateUrl: './hero-4.component.html',
  styleUrls: ['./hero-4.component.css']
})
export class Hero4Component {
  @Input() heroId: number = 4;
  name: string = 'Hero 4';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}