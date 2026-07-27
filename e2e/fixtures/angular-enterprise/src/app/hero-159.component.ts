import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-159',
  templateUrl: './hero-159.component.html',
  styleUrls: ['./hero-159.component.css']
})
export class Hero159Component {
  @Input() heroId: number = 159;
  name: string = 'Hero 159';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}