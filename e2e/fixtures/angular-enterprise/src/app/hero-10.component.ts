import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-10',
  templateUrl: './hero-10.component.html',
  styleUrls: ['./hero-10.component.css']
})
export class Hero10Component {
  @Input() heroId: number = 10;
  name: string = 'Hero 10';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}