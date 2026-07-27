import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-126',
  templateUrl: './hero-126.component.html',
  styleUrls: ['./hero-126.component.css']
})
export class Hero126Component {
  @Input() heroId: number = 126;
  name: string = 'Hero 126';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}