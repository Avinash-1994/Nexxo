import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-181',
  templateUrl: './hero-181.component.html',
  styleUrls: ['./hero-181.component.css']
})
export class Hero181Component {
  @Input() heroId: number = 181;
  name: string = 'Hero 181';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}