import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-177',
  templateUrl: './hero-177.component.html',
  styleUrls: ['./hero-177.component.css']
})
export class Hero177Component {
  @Input() heroId: number = 177;
  name: string = 'Hero 177';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}