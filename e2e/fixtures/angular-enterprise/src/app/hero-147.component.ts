import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-147',
  templateUrl: './hero-147.component.html',
  styleUrls: ['./hero-147.component.css']
})
export class Hero147Component {
  @Input() heroId: number = 147;
  name: string = 'Hero 147';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}