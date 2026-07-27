import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-53',
  templateUrl: './hero-53.component.html',
  styleUrls: ['./hero-53.component.css']
})
export class Hero53Component {
  @Input() heroId: number = 53;
  name: string = 'Hero 53';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}