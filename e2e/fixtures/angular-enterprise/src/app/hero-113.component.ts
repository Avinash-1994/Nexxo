import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-113',
  templateUrl: './hero-113.component.html',
  styleUrls: ['./hero-113.component.css']
})
export class Hero113Component {
  @Input() heroId: number = 113;
  name: string = 'Hero 113';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}