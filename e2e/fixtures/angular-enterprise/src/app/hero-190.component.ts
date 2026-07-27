import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-190',
  templateUrl: './hero-190.component.html',
  styleUrls: ['./hero-190.component.css']
})
export class Hero190Component {
  @Input() heroId: number = 190;
  name: string = 'Hero 190';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}