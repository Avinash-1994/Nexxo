import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-114',
  templateUrl: './hero-114.component.html',
  styleUrls: ['./hero-114.component.css']
})
export class Hero114Component {
  @Input() heroId: number = 114;
  name: string = 'Hero 114';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}