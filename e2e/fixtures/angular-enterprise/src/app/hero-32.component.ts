import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-32',
  templateUrl: './hero-32.component.html',
  styleUrls: ['./hero-32.component.css']
})
export class Hero32Component {
  @Input() heroId: number = 32;
  name: string = 'Hero 32';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}