import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-99',
  templateUrl: './hero-99.component.html',
  styleUrls: ['./hero-99.component.css']
})
export class Hero99Component {
  @Input() heroId: number = 99;
  name: string = 'Hero 99';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}